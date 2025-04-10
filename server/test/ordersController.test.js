const ordersController = require('../Controller/ordersController');
const Order = require('../model/orders');
const User = require('../model/users');
const Garage = require('../model/garages');
const OrderItem = require('../model/orderItems');
const Appointment = require('../model/appointments');
const Inventory = require('../model/inventory');
const sequelize = require('../config/config');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailService');

jest.mock('../model/orders', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
}));

jest.mock('../model/users', () => ({
    findByPk: jest.fn()
}));

jest.mock('../model/garages', () => ({
    findByPk: jest.fn()
}));

jest.mock('../model/orderItems', () => ({
    findAll: jest.fn(),
    create: jest.fn()
}));

jest.mock('../model/appointments', () => ({
    findOne: jest.fn()
}));

jest.mock('../model/inventory', () => ({
    findByPk: jest.fn()
}));

jest.mock('../config/config', () => ({
    transaction: jest.fn()
}));

jest.mock('../utils/emailService', () => ({
    sendOrderConfirmationEmail: jest.fn(),
    sendOrderStatusUpdateEmail: jest.fn()
}));

describe('Orders Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            user: { id: 1 }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getAllOrders', () => {
        it('should return all orders', async () => {
            const mockOrders = [
                {
                    id: 1,
                    user_id: 1,
                    garage_id: 1,
                    total_price: 200,
                    status: 'pending',
                    User: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
                    Garage: { id: 1, name: 'Garage 1', location: 'Location 1' }
                },
                {
                    id: 2,
                    user_id: 2,
                    garage_id: 1,
                    total_price: 150,
                    status: 'confirmed',
                    User: { id: 2, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
                    Garage: { id: 1, name: 'Garage 1', location: 'Location 1' }
                }
            ];

            Order.findAll.mockResolvedValue(mockOrders);

            await ordersController.getAllOrders(req, res);

            expect(Order.findAll).toHaveBeenCalledWith({
                attributes: ["id", "user_id", "garage_id", "total_price", "order_date", "status"],
                include: [
                    {
                        model: User,
                        attributes: ["id", "first_name", "last_name", "email"],
                    },
                    {
                        model: Garage,
                        attributes: ["id", "name", "location"],
                    },
                ],
            });
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            Order.findAll.mockRejectedValue(error);

            await ordersController.getAllOrders(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getOrderById', () => {
        it('should return an order by id', async () => {
            const mockOrder = {
                id: 1,
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                User: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
                Garage: { id: 1, name: 'Garage 1', location: 'Location 1' }
            };

            req.params.id = 1;

            Order.findByPk.mockResolvedValue(mockOrder);

            await ordersController.getOrderById(req, res);

            expect(Order.findByPk).toHaveBeenCalledWith(1, {
                include: [
                    {
                        model: User,
                        attributes: ["id", "first_name", "last_name", "email"],
                    },
                    {
                        model: Garage,
                        attributes: ["id", "name", "location"],
                    },
                ],
            });
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        it('should return 404 if order not found', async () => {
            req.params.id = 999;
            Order.findByPk.mockResolvedValue(null);

            await ordersController.getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Order.findByPk.mockRejectedValue(error);

            await ordersController.getOrderById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getOrdersByGarageId', () => {
        it('should return orders by garage id', async () => {
            const mockGarage = { id: 1, name: 'Garage 1', location: 'Location 1' };

            const mockOrders = [
                {
                    id: 1,
                    user_id: 1,
                    garage_id: 1,
                    total_price: 200,
                    status: 'pending',
                    User: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: '1234567890' },
                    Garage: { id: 1, name: 'Garage 1', location: 'Location 1' }
                },
                {
                    id: 2,
                    user_id: 2,
                    garage_id: 1,
                    total_price: 150,
                    status: 'confirmed',
                    User: { id: 2, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', phone: '0987654321' },
                    Garage: { id: 1, name: 'Garage 1', location: 'Location 1' }
                }
            ];

            req.params.garageId = 1;

            Garage.findByPk.mockResolvedValue(mockGarage);
            Order.findAll.mockResolvedValue(mockOrders);

            await ordersController.getOrdersByGarageId(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(Order.findAll).toHaveBeenCalledWith({
                where: { garage_id: 1 },
                include: [
                    {
                        model: User,
                        attributes: ["id", "first_name", "last_name", "email", "phone"],
                    },
                    {
                        model: Garage,
                        attributes: ["id", "name", "location"],
                    },
                ],
                order: [['order_date', 'DESC']]
            });
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should return 404 if garage not found', async () => {
            req.params.garageId = 999;
            Garage.findByPk.mockResolvedValue(null);

            await ordersController.getOrdersByGarageId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage not found' });
        });

        it('should handle errors', async () => {
            req.params.garageId = 1;
            const error = new Error('Database error');
            Garage.findByPk.mockRejectedValue(error);

            await ordersController.getOrdersByGarageId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Server error',
                error: error.message
            }));
        });
    });

    describe('createOrder', () => {
        it('should create a new order with items', async () => {
            const mockOrder = {
                id: 1,
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                order_date: new Date()
            };

            const mockItems = [
                { product_id: 1, quantity: 2, unit_price: 50 },
                { product_id: 2, quantity: 1, unit_price: 100 }
            ];

            req.body = {
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                items: mockItems
            };

            const mockUser = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
            const mockGarage = { id: 1, name: 'Garage 1' };

            const mockInventoryItems = [
                { id: 1, item_name: 'Item 1', quantity: 5, update: jest.fn() },
                { id: 2, item_name: 'Item 2', quantity: 3, update: jest.fn() }
            ];

            sequelize.transaction.mockImplementation(callback => {
                return callback({ transaction: 'tx' });
            });

            Order.create.mockResolvedValue(mockOrder);

            OrderItem.create.mockImplementation((data) => {
                return Promise.resolve({
                    id: data.product_id,
                    ...data
                });
            });

            Inventory.findByPk.mockImplementation((id) => {
                return Promise.resolve(mockInventoryItems.find(item => item.id === id));
            });

            User.findByPk.mockResolvedValue(mockUser);
            Garage.findByPk.mockResolvedValue(mockGarage);

            await ordersController.createOrder(req, res);

            expect(sequelize.transaction).toHaveBeenCalled();
            expect(Order.create).toHaveBeenCalledWith({
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending'
            }, { transaction: 'tx' });

            expect(OrderItem.create).toHaveBeenCalledTimes(2);
            expect(Inventory.findByPk).toHaveBeenCalledTimes(2);

            expect(mockInventoryItems[0].update).toHaveBeenCalledWith({
                quantity: 3
            }, { transaction: 'tx' });

            expect(mockInventoryItems[1].update).toHaveBeenCalledWith({
                quantity: 2
            }, { transaction: 'tx' });

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { user_id: 1 };

            await ordersController.createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Missing required fields (user_id, garage_id, total_price, status)'
            });
            expect(sequelize.transaction).not.toHaveBeenCalled();
        });

        it('should return 400 if not enough stock', async () => {
            const mockItems = [
                { product_id: 1, quantity: 10, unit_price: 50 }
            ];

            req.body = {
                user_id: 1,
                garage_id: 1,
                total_price: 500,
                status: 'pending',
                items: mockItems
            };

            const mockInventoryItem = { id: 1, item_name: 'Item 1', quantity: 5 };

            sequelize.transaction.mockImplementation(callback => {
                return callback({ transaction: 'tx' });
            });

            Order.create.mockResolvedValue({ id: 1 });
            Inventory.findByPk.mockResolvedValue(mockInventoryItem);

            await ordersController.createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: expect.stringContaining('Not enough stock')
            });
        });

        it('should handle errors', async () => {
            req.body = {
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                items: [{ product_id: 1, quantity: 2, unit_price: 100 }]
            };

            const error = new Error('Database error');
            sequelize.transaction.mockRejectedValue(error);

            await ordersController.createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('updateOrder', () => {
        it('should update an order', async () => {
            const mockOrder = {
                id: 1,
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                update: jest.fn()
            };

            req.params.id = 1;
            req.body = {
                user_id: 1,
                garage_id: 1,
                total_price: 250,
                status: 'confirmed'
            };

            Order.findByPk.mockResolvedValue(mockOrder);

            sequelize.transaction.mockImplementation(callback => {
                return callback({ transaction: 'tx' });
            });

            const mockUser = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
            const mockGarage = { id: 1, name: 'Garage 1' };

            User.findByPk.mockResolvedValue(mockUser);
            Garage.findByPk.mockResolvedValue(mockGarage);

            await ordersController.updateOrder(req, res);

            expect(Order.findByPk).toHaveBeenCalledWith(1);
            expect(sequelize.transaction).toHaveBeenCalled();
            expect(mockOrder.update).toHaveBeenCalledWith({
                user_id: 1,
                garage_id: 1,
                total_price: 250,
                status: 'confirmed'
            }, { transaction: 'tx' });
            expect(sendOrderStatusUpdateEmail).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        it('should restore inventory when order is canceled', async () => {
            const mockOrder = {
                id: 1,
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                update: jest.fn()
            };

            req.params.id = 1;
            req.body = {
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'canceled'
            };

            const mockOrderItems = [
                { order_id: 1, product_id: 1, quantity: 2 },
                { order_id: 1, product_id: 2, quantity: 1 }
            ];

            const mockInventoryItems = [
                { id: 1, quantity: 3, update: jest.fn() },
                { id: 2, quantity: 4, update: jest.fn() }
            ];

            Order.findByPk.mockResolvedValue(mockOrder);
            OrderItem.findAll.mockResolvedValue(mockOrderItems);

            Inventory.findByPk.mockImplementation((id) => {
                return Promise.resolve(mockInventoryItems.find(item => item.id === id));
            });

            sequelize.transaction.mockImplementation(callback => {
                return callback({ transaction: 'tx' });
            });

            const mockUser = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
            const mockGarage = { id: 1, name: 'Garage 1' };

            User.findByPk.mockResolvedValue(mockUser);
            Garage.findByPk.mockResolvedValue(mockGarage);

            await ordersController.updateOrder(req, res);

            expect(Order.findByPk).toHaveBeenCalledWith(1);
            expect(sequelize.transaction).toHaveBeenCalled();
            expect(OrderItem.findAll).toHaveBeenCalledWith({
                where: { order_id: 1 },
                transaction: 'tx'
            });

            expect(mockInventoryItems[0].update).toHaveBeenCalledWith({
                quantity: 5
            }, { transaction: 'tx' });

            expect(mockInventoryItems[1].update).toHaveBeenCalledWith({
                quantity: 5
            }, { transaction: 'tx' });

            expect(sendOrderStatusUpdateEmail).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockOrder);
        });

        it('should return 404 if order not found', async () => {
            req.params.id = 999;
            Order.findByPk.mockResolvedValue(null);

            await ordersController.updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Order.findByPk.mockRejectedValue(error);

            await ordersController.updateOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order', async () => {
            const mockOrder = {
                id: 1,
                user_id: 1,
                garage_id: 1,
                total_price: 200,
                status: 'pending',
                destroy: jest.fn().mockResolvedValue(undefined)
            };

            req.params.id = 1;

            Order.findByPk.mockResolvedValue(mockOrder);

            await ordersController.deleteOrder(req, res);

            expect(Order.findByPk).toHaveBeenCalledWith(1);
            expect(mockOrder.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Order deleted successfully' });
        });

        it('should return 404 if order not found', async () => {
            req.params.id = 999;
            Order.findByPk.mockResolvedValue(null);

            await ordersController.deleteOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Order.findByPk.mockRejectedValue(error);

            await ordersController.deleteOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getOrdersByUserId', () => {
        it('should return orders by user id', async () => {
            const mockUser = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };

            const mockOrders = [
                {
                    id: 1,
                    user_id: 1,
                    garage_id: 1,
                    total_price: 200,
                    status: 'pending',
                    User: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
                    Garage: { id: 1, name: 'Garage 1', location: 'Location 1' }
                },
                {
                    id: 2,
                    user_id: 1,
                    garage_id: 2,
                    total_price: 150,
                    status: 'confirmed',
                    User: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
                    Garage: { id: 2, name: 'Garage 2', location: 'Location 2' }
                }
            ];

            req.params.userId = 1;
            req.user = { id: 1 };

            User.findByPk.mockResolvedValue(mockUser);
            Order.findAll.mockResolvedValue(mockOrders);

            await ordersController.getOrdersByUserId(req, res);

            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(Order.findAll).toHaveBeenCalledWith({
                where: { user_id: 1 },
                include: [
                    {
                        model: User,
                        attributes: ["id", "first_name", "last_name", "email"],
                    },
                    {
                        model: Garage,
                        attributes: ["id", "name", "location"],
                    },
                ],
                order: [['order_date', 'DESC']]
            });
            expect(res.json).toHaveBeenCalledWith(mockOrders);
        });

        it('should return 404 if user not found', async () => {
            req.params.userId = 999;
            User.findByPk.mockResolvedValue(null);

            await ordersController.getOrdersByUserId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should return 403 if trying to access another user\'s orders', async () => {
            req.params.userId = 2;
            req.user = { id: 1 };

            const mockUser = { id: 2, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' };
            User.findByPk.mockResolvedValue(mockUser);

            await ordersController.getOrdersByUserId(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Unauthorized access to another user\'s orders'
            });
        });

        it('should handle errors', async () => {
            req.params.userId = 1;
            const error = new Error('Database error');
            User.findByPk.mockRejectedValue(error);

            await ordersController.getOrdersByUserId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Server error',
                error: error.message
            }));
        });
    });
});    