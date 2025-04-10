const inventoryController = require('../Controller/inventoryController');
const Inventory = require('../model/inventory');
const Garage = require('../model/garages');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

jest.mock('../model/inventory', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
}));

jest.mock('../model/garages', () => ({
    findByPk: jest.fn()
}));

jest.mock('sequelize', () => ({
    Op: {
        gte: 'gte',
        lte: 'lte',
        like: 'like'
    }
}));

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    unlinkSync: jest.fn()
}));

jest.mock('path', () => ({
    join: jest.fn()
}));

describe('Inventory Controller', () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            query: {},
            files: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('getAllItems', () => {
        it('should return all inventory items', async () => {
            const mockItems = [
                { id: 1, garage_id: 1, item_name: 'Item 1', vehicle_type: 'car', quantity: 10, unit_price: 100 },
                { id: 2, garage_id: 1, item_name: 'Item 2', vehicle_type: 'motorcycle', quantity: 5, unit_price: 50 }
            ];

            Inventory.findAll.mockResolvedValue(mockItems);

            await inventoryController.getAllItems(req, res);

            expect(Inventory.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });

        it('should filter items by garage_id', async () => {
            req.query.garage_id = '1';

            const mockItems = [
                { id: 1, garage_id: 1, item_name: 'Item 1', vehicle_type: 'car', quantity: 10, unit_price: 100 }
            ];

            Inventory.findAll.mockResolvedValue(mockItems);

            await inventoryController.getAllItems(req, res);

            expect(Inventory.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    garage_id: 1
                })
            }));
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });

        it('should filter items by vehicle_type', async () => {
            req.query.vehicle_type = 'car';

            const mockItems = [
                { id: 1, garage_id: 1, item_name: 'Item 1', vehicle_type: 'car', quantity: 10, unit_price: 100 }
            ];

            Inventory.findAll.mockResolvedValue(mockItems);

            await inventoryController.getAllItems(req, res);

            expect(Inventory.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    vehicle_type: 'car'
                })
            }));
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });

        it('should filter items by price range', async () => {
            req.query.min_price = '50';
            req.query.max_price = '150';

            const mockItems = [
                { id: 1, garage_id: 1, item_name: 'Item 1', vehicle_type: 'car', quantity: 10, unit_price: 100 }
            ];

            Inventory.findAll.mockResolvedValue(mockItems);

            await inventoryController.getAllItems(req, res);

            expect(Inventory.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    unit_price: {
                        [Op.gte]: 50,
                        [Op.lte]: 150
                    }
                })
            }));
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });

        it('should handle search query', async () => {
            req.query.search = 'test';

            const mockItems = [
                { id: 1, garage_id: 1, item_name: 'Test Item', vehicle_type: 'car', quantity: 10, unit_price: 100 }
            ];

            Inventory.findAll.mockResolvedValue(mockItems);

            await inventoryController.getAllItems(req, res);

            expect(Inventory.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    item_name: {
                        [Op.like]: '%test%'
                    }
                })
            }));
            expect(res.json).toHaveBeenCalledWith(mockItems);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            Inventory.findAll.mockRejectedValue(error);

            await inventoryController.getAllItems(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getItemById', () => {
        it('should return an item by id', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'Item 1',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                Garage: {
                    id: 1,
                    name: 'Garage 1',
                    location: 'Location 1',
                    contact_info: '123456789'
                }
            };
            req.params.id = 1;

            Inventory.findByPk.mockResolvedValue(mockItem);

            await inventoryController.getItemById(req, res);

            expect(Inventory.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
            expect(res.json).toHaveBeenCalledWith(mockItem);
        });

        it('should return 404 if item not found', async () => {
            req.params.id = 999;
            Inventory.findByPk.mockResolvedValue(null);

            await inventoryController.getItemById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Inventory.findByPk.mockRejectedValue(error);

            await inventoryController.getItemById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('createItem', () => {
        it('should create a new inventory item', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'New Item',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                description: 'Description',
                season: 'winter',
                width: 205,
                profile: 55,
                diameter: 16
            };

            req.body = {
                garage_id: 1,
                item_name: 'New Item',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                description: 'Description',
                season: 'winter',
                width: 205,
                profile: 55,
                diameter: 16
            };

            req.files = {
                cover_img: [{ filename: 'cover.jpg' }],
                additional_img1: [{ filename: 'add1.jpg' }],
                additional_img2: [{ filename: 'add2.jpg' }]
            };

            const mockGarage = { id: 1, name: 'Garage 1' };
            Garage.findByPk.mockResolvedValue(mockGarage);

            Inventory.create.mockResolvedValue(mockItem);
            Inventory.findByPk.mockResolvedValue({
                ...mockItem,
                Garage: mockGarage
            });

            await inventoryController.createItem(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(Inventory.create).toHaveBeenCalledWith(expect.objectContaining({
                garage_id: 1,
                item_name: 'New Item',
                vehicle_type: 'car',
                cover_img: '/uploads/inventory/cover.jpg',
                additional_img1: '/uploads/inventory/add1.jpg',
                additional_img2: '/uploads/inventory/add2.jpg'
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = { garage_id: 1 };

            await inventoryController.createItem(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Missing required fields'
            }));
            expect(Inventory.create).not.toHaveBeenCalled();
        });

        it('should return 400 if vehicle_type is invalid', async () => {
            req.body = {
                garage_id: 1,
                item_name: 'New Item',
                vehicle_type: 'invalid',
                unit_price: 100
            };

            await inventoryController.createItem(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid vehicle type. Must be one of: car, motorcycle, truck'
            }));
            expect(Inventory.create).not.toHaveBeenCalled();
        });

        it('should return 404 if garage not found', async () => {
            req.body = {
                garage_id: 999,
                item_name: 'New Item',
                vehicle_type: 'car',
                unit_price: 100
            };

            Garage.findByPk.mockResolvedValue(null);

            await inventoryController.createItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage with ID 999 not found' });
            expect(Inventory.create).not.toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            req.body = {
                garage_id: 1,
                item_name: 'New Item',
                vehicle_type: 'car',
                unit_price: 100
            };

            const mockGarage = { id: 1, name: 'Garage 1' };
            Garage.findByPk.mockResolvedValue(mockGarage);

            const error = new Error('Database error');
            Inventory.create.mockRejectedValue(error);

            await inventoryController.createItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('updateItem', () => {
        it('should update an inventory item', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'Item 1',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                cover_img: '/uploads/inventory/old-cover.jpg',
                additional_img1: '/uploads/inventory/old-add1.jpg',
                additional_img2: '/uploads/inventory/old-add2.jpg',
                update: jest.fn()
            };

            req.params.id = 1;
            req.body = {
                item_name: 'Updated Item',
                quantity: 15,
                unit_price: 120
            };

            Inventory.findByPk.mockImplementation((id, options) => {
                if (options) {
                    return Promise.resolve({
                        ...mockItem,
                        Garage: { id: 1, name: 'Garage 1', location: 'Location 1', contact_info: '123456789' }
                    });
                }
                return Promise.resolve(mockItem);
            });

            await inventoryController.updateItem(req, res);

            expect(Inventory.findByPk).toHaveBeenCalledWith(1);
            expect(mockItem.update).toHaveBeenCalledWith(expect.objectContaining({
                item_name: 'Updated Item',
                quantity: 15,
                unit_price: 120
            }));
            expect(res.json).toHaveBeenCalled();
        });

        it('should update item with new images', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'Item 1',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                cover_img: '/uploads/inventory/old-cover.jpg',
                additional_img1: '/uploads/inventory/old-add1.jpg',
                additional_img2: '/uploads/inventory/old-add2.jpg',
                update: jest.fn()
            };

            req.params.id = 1;
            req.body = {
                item_name: 'Updated Item'
            };
            req.files = {
                cover_img: [{
                    filename: 'new-cover.jpg'
                }]
            };

            Inventory.findByPk.mockImplementation((id, options) => {
                if (options) {
                    return Promise.resolve({
                        ...mockItem,
                        Garage: { id: 1, name: 'Garage 1', location: 'Location 1', contact_info: '123456789' }
                    });
                }
                return Promise.resolve(mockItem);
            });

            path.join.mockReturnValue('/path/to/old-cover.jpg');
            fs.existsSync.mockReturnValue(true);

            await inventoryController.updateItem(req, res);

            expect(Inventory.findByPk).toHaveBeenCalledWith(1);
            expect(path.join).toHaveBeenCalled();
            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(mockItem.update).toHaveBeenCalledWith(expect.objectContaining({
                item_name: 'Updated Item',
                cover_img: '/uploads/inventory/new-cover.jpg'
            }));
            expect(res.json).toHaveBeenCalled();
        });

        it('should remove additional images when requested', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'Item 1',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                cover_img: '/uploads/inventory/cover.jpg',
                additional_img1: '/uploads/inventory/add1.jpg',
                additional_img2: '/uploads/inventory/add2.jpg',
                update: jest.fn()
            };

            req.params.id = 1;
            req.body = {
                item_name: 'Updated Item',
                remove_additional_img1: 'true',
                remove_additional_img2: 'true'
            };

            Inventory.findByPk.mockImplementation((id, options) => {
                if (options) {
                    return Promise.resolve({
                        ...mockItem,
                        Garage: { id: 1, name: 'Garage 1', location: 'Location 1', contact_info: '123456789' }
                    });
                }
                return Promise.resolve(mockItem);
            });

            path.join.mockReturnValue('/path/to/image.jpg');
            fs.existsSync.mockReturnValue(true);

            await inventoryController.updateItem(req, res);

            expect(Inventory.findByPk).toHaveBeenCalledWith(1);
            expect(path.join).toHaveBeenCalledTimes(2);
            expect(fs.existsSync).toHaveBeenCalledTimes(2);
            expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
            expect(mockItem.update).toHaveBeenCalledWith(expect.objectContaining({
                item_name: 'Updated Item',
                additional_img1: null,
                additional_img2: null
            }));
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 404 if item not found', async () => {
            req.params.id = 999;
            Inventory.findByPk.mockResolvedValue(null);

            await inventoryController.updateItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
        });

        it('should return 400 if vehicle_type is invalid', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'Item 1',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100
            };

            req.params.id = 1;
            req.body = {
                vehicle_type: 'invalid'
            };

            Inventory.findByPk.mockResolvedValue(mockItem);

            await inventoryController.updateItem(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Invalid vehicle type. Must be one of: car, motorcycle, truck'
            }));
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Inventory.findByPk.mockRejectedValue(error);

            await inventoryController.updateItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('deleteItem', () => {
        it('should delete an inventory item', async () => {
            const mockItem = {
                id: 1,
                garage_id: 1,
                item_name: 'Item 1',
                vehicle_type: 'car',
                quantity: 10,
                unit_price: 100,
                cover_img: '/uploads/inventory/cover.jpg',
                additional_img1: '/uploads/inventory/add1.jpg',
                additional_img2: '/uploads/inventory/add2.jpg',
                destroy: jest.fn().mockResolvedValue(undefined)
            };

            req.params.id = 1;

            Inventory.findByPk.mockResolvedValue(mockItem);
            path.join.mockReturnValue('/path/to/image.jpg');
            fs.existsSync.mockReturnValue(true);

            await inventoryController.deleteItem(req, res);

            expect(Inventory.findByPk).toHaveBeenCalledWith(1);
            expect(path.join).toHaveBeenCalledTimes(3);
            expect(fs.existsSync).toHaveBeenCalledTimes(3);
            expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
            expect(mockItem.destroy).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Item deleted successfully',
                deletedItem: expect.objectContaining({
                    id: 1,
                    item_name: 'Item 1',
                    garage_id: 1
                })
            }));
        });

        it('should return 404 if item not found', async () => {
            req.params.id = 999;
            Inventory.findByPk.mockResolvedValue(null);

            await inventoryController.deleteItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            const error = new Error('Database error');
            Inventory.findByPk.mockRejectedValue(error);

            await inventoryController.deleteItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('getItemsByGarageId', () => {
        it('should return items by garage id', async () => {
            const mockGarage = {
                id: 1,
                name: 'Garage 1',
                location: 'Location 1'
            };

            const mockItems = [
                { id: 1, garage_id: 1, item_name: 'Item 1', vehicle_type: 'car', quantity: 10, unit_price: 100 },
                { id: 2, garage_id: 1, item_name: 'Item 2', vehicle_type: 'motorcycle', quantity: 5, unit_price: 50 }
            ];

            req.params.garageId = 1;

            Garage.findByPk.mockResolvedValue(mockGarage);
            Inventory.findAll.mockResolvedValue(mockItems);

            await inventoryController.getItemsByGarageId(req, res);

            expect(Garage.findByPk).toHaveBeenCalledWith(1);
            expect(Inventory.findAll).toHaveBeenCalledWith({
                where: { garage_id: 1 },
                attributes: expect.any(Array),
                order: [['createdAt', 'DESC']]
            });
            expect(res.json).toHaveBeenCalledWith({
                garage: {
                    id: 1,
                    name: 'Garage 1',
                    location: 'Location 1'
                },
                items: mockItems
            });
        });

        it('should return 400 if garage id is invalid', async () => {
            req.params.garageId = 'invalid';

            await inventoryController.getItemsByGarageId(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid garage ID' });
        });

        it('should return 404 if garage not found', async () => {
            req.params.garageId = 999;
            Garage.findByPk.mockResolvedValue(null);

            await inventoryController.getItemsByGarageId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Garage with ID 999 not found' });
        });

        it('should handle errors', async () => {
            req.params.garageId = 1;
            const error = new Error('Database error');
            Garage.findByPk.mockRejectedValue(error);

            await inventoryController.getItemsByGarageId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });

    describe('updateItemQuantity', () => {
        it('should update item quantity', async () => {
            const mockItem = {
                id: 1,
                item_name: 'Item 1',
                quantity: 10,
                previous: jest.fn().mockReturnValue(10),
                update: jest.fn().mockResolvedValue({ id: 1, item_name: 'Item 1', quantity: 15 })
            };

            req.params.id = 1;
            req.body = { quantity: 15 };

            Inventory.findByPk.mockResolvedValue(mockItem);

            await inventoryController.updateItemQuantity(req, res);

            expect(Inventory.findByPk).toHaveBeenCalledWith(1);
            expect(mockItem.update).toHaveBeenCalledWith({ quantity: 15 });
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Quantity updated successfully',
                item: expect.objectContaining({
                    id: 1,
                    item_name: 'Item 1',
                    quantity: 15,
                    previous_quantity: 10
                })
            }));
        });

        it('should return 400 if quantity is invalid', async () => {
            req.params.id = 1;
            req.body = { quantity: 'invalid' };

            await inventoryController.updateItemQuantity(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'quantity must be a number' });
        });

        it('should return 404 if item not found', async () => {
            req.params.id = 999;
            req.body = { quantity: 15 };

            Inventory.findByPk.mockResolvedValue(null);

            await inventoryController.updateItemQuantity(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Item not found' });
        });

        it('should handle errors', async () => {
            req.params.id = 1;
            req.body = { quantity: 15 };

            const error = new Error('Database error');
            Inventory.findByPk.mockRejectedValue(error);

            await inventoryController.updateItemQuantity(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Server error',
                error: error.message
            });
        });
    });
});  