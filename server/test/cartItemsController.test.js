const cartItemsController = require('../Controller/cartItemsController');
const CartItem = require('../model/cartItems');

jest.mock('../model/cartItems', () => {
    return {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn()
    };
});

describe('Cart Items Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getAllCartItems', () => {
        it('should return all cart items', async () => {
            const mockCartItems = [
                { id: 1, cart_id: 1, product_id: 1, quantity: 2 },
                { id: 2, cart_id: 1, product_id: 2, quantity: 1 }
            ];

            CartItem.findAll.mockResolvedValue(mockCartItems);

            await cartItemsController.getAllCartItems(req, res);

            expect(CartItem.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockCartItems);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            CartItem.findAll.mockRejectedValue(error);

            await cartItemsController.getAllCartItems(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getCartItemById', () => {
        it('should return a cart item by id', async () => {
            const mockCartItem = { id: 1, cart_id: 1, product_id: 1, quantity: 2 };
            req.params.id = 1;

            CartItem.findByPk.mockResolvedValue(mockCartItem);

            await cartItemsController.getCartItemById(req, res);

            expect(CartItem.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockCartItem);
        });

        it('should return 404 if cart item not found', async () => {
            req.params.id = 999;
            CartItem.findByPk.mockResolvedValue(null);

            await cartItemsController.getCartItemById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            CartItem.findByPk.mockRejectedValue(error);

            await cartItemsController.getCartItemById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('createCartItem', () => {
        it('should create a new cart item', async () => {
            const mockCartItem = { id: 1, cart_id: 1, product_id: 1, quantity: 2 };
            req.body = { cart_id: 1, product_id: 1, quantity: 2 };

            CartItem.create.mockResolvedValue(mockCartItem);

            await cartItemsController.createCartItem(req, res);

            expect(CartItem.create).toHaveBeenCalledWith({
                cart_id: 1,
                product_type: "inventory",
                product_id: 1,
                quantity: 2
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockCartItem);
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { cart_id: 1, product_id: 1 };

            await cartItemsController.createCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Missing required fields'
            });
            expect(CartItem.create).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.body = { cart_id: 1, product_id: 1, quantity: 2 };
            const error = new Error('Database error');
            CartItem.create.mockRejectedValue(error);

            await cartItemsController.createCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('updateCartItem', () => {
        it('should update a cart item', async () => {
            const mockCartItem = {
                id: 1,
                cart_id: 1,
                product_id: 1,
                quantity: 2,
                update: jest.fn().mockResolvedValue({
                    id: 1,
                    cart_id: 1,
                    product_id: 1,
                    quantity: 3
                })
            };
            req.params.id = 1;
            req.body = { cart_id: 1, product_id: 1, quantity: 3 };

            CartItem.findByPk.mockResolvedValue(mockCartItem);

            await cartItemsController.updateCartItem(req, res);

            expect(CartItem.findByPk).toHaveBeenCalledWith(1);
            expect(mockCartItem.update).toHaveBeenCalledWith({
                cart_id: 1,
                product_type: "inventory",
                product_id: 1,
                quantity: 3
            });
            expect(res.json).toHaveBeenCalledWith(mockCartItem);
        });

        it('should return 404 if cart item not found', async () => {
            req.params.id = 999;
            CartItem.findByPk.mockResolvedValue(null);

            await cartItemsController.updateCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            CartItem.findByPk.mockRejectedValue(error);

            await cartItemsController.updateCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('deleteCartItem', () => {
        it('should delete a cart item', async () => {
            const mockCartItem = {
                id: 1,
                cart_id: 1,
                product_id: 1,
                quantity: 2,
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            req.params.id = 1;

            CartItem.findByPk.mockResolvedValue(mockCartItem);

            await cartItemsController.deleteCartItem(req, res);

            expect(CartItem.findByPk).toHaveBeenCalledWith(1);
            expect(mockCartItem.destroy).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart item deleted successfully' });
        });

        it('should return 404 if cart item not found', async () => {
            req.params.id = 999;
            CartItem.findByPk.mockResolvedValue(null);

            await cartItemsController.deleteCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            CartItem.findByPk.mockRejectedValue(error);

            await cartItemsController.deleteCartItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });
});