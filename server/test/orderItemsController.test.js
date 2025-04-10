const orderItemsController = require('../Controller/orderItemsController');
const OrderItem = require('../model/orderItems');
const Inventory = require('../model/inventory');

jest.mock('../model/orderItems', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));

jest.mock('../model/inventory', () => ({
  findByPk: jest.fn()
}));

describe('Order Items Controller', () => {
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

  describe('getAllOrderItems', () => {
    it('should return all order items', async () => {
      const mockOrderItems = [
        { id: 1, order_id: 1, product_id: 1, quantity: 2, unit_price: 100 },
        { id: 2, order_id: 1, product_id: 2, quantity: 1, unit_price: 50 }
      ];
      
      OrderItem.findAll.mockResolvedValue(mockOrderItems);
      
      await orderItemsController.getAllOrderItems(req, res);
      
      expect(OrderItem.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockOrderItems);
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      OrderItem.findAll.mockRejectedValue(error);
      
      await orderItemsController.getAllOrderItems(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Server error', 
        error: error.message 
      });
    });
  });
  
  describe('getOrderItemById', () => {
    it('should return an order item by id', async () => {
      const mockOrderItem = { id: 1, order_id: 1, product_id: 1, quantity: 2, unit_price: 100 };
      req.params.id = 1;
      
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);
      
      await orderItemsController.getOrderItemById(req, res);
      
      expect(OrderItem.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockOrderItem);
    });
    
    it('should return 404 if order item not found', async () => {
      req.params.id = 999;
      OrderItem.findByPk.mockResolvedValue(null);
      
      await orderItemsController.getOrderItemById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order item not found' });
    });
    
    it('should handle errors', async () => {
      req.params.id = 1;
      const error = new Error('Database error');
      OrderItem.findByPk.mockRejectedValue(error);
      
      await orderItemsController.getOrderItemById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Server error', 
        error: error.message 
      });
    });
  });
  
  describe('getOrderItemsByOrderId', () => {
    it('should return order items by order id with product details', async () => {
      const mockOrderItems = [
        { 
          id: 1, 
          order_id: 1, 
          product_id: 1, 
          product_type: 'inventory', 
          quantity: 2, 
          unit_price: 100,
          toJSON: () => ({
            id: 1, 
            order_id: 1, 
            product_id: 1, 
            product_type: 'inventory', 
            quantity: 2, 
            unit_price: 100
          })
        },
        { 
          id: 2, 
          order_id: 1, 
          product_id: 2, 
          product_type: 'inventory', 
          quantity: 1, 
          unit_price: 50,
          toJSON: () => ({
            id: 2, 
            order_id: 1, 
            product_id: 2, 
            product_type: 'inventory', 
            quantity: 1, 
            unit_price: 50
          })
        }
      ];
      
      const mockProducts = [
        { id: 1, item_name: 'Product 1', vehicle_type: 'car' },
        { id: 2, item_name: 'Product 2', vehicle_type: 'motorcycle' }
      ];
      
      req.params.orderId = 1;
      
      OrderItem.findAll.mockResolvedValue(mockOrderItems);
      Inventory.findByPk.mockImplementation((id) => {
        return Promise.resolve(mockProducts.find(p => p.id === id));
      });
      
      await orderItemsController.getOrderItemsByOrderId(req, res);
      
      expect(OrderItem.findAll).toHaveBeenCalledWith({
        where: { order_id: 1 }
      });
      expect(Inventory.findByPk).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 1,
          order_id: 1,
          product_id: 1,
          quantity: 2,
          unit_price: 100,
          product_name: 'Product 1',
          product_details: mockProducts[0]
        }),
        expect.objectContaining({
          id: 2,
          order_id: 1,
          product_id: 2,
          quantity: 1,
          unit_price: 50,
          product_name: 'Product 2',
          product_details: mockProducts[1]
        })
      ]);
    });
    
    it('should handle missing products gracefully', async () => {
      const mockOrderItems = [
        { 
          id: 1, 
          order_id: 1, 
          product_id: 999, 
          product_type: 'inventory', 
          quantity: 2, 
          unit_price: 100,
          toJSON: () => ({
            id: 1, 
            order_id: 1, 
            product_id: 999, 
            product_type: 'inventory', 
            quantity: 2, 
            unit_price: 100
          })
        }
      ];
      
      req.params.orderId = 1;
      
      OrderItem.findAll.mockResolvedValue(mockOrderItems);
      Inventory.findByPk.mockResolvedValue(null);
      
      await orderItemsController.getOrderItemsByOrderId(req, res);
      
      expect(OrderItem.findAll).toHaveBeenCalledWith({
        where: { order_id: 1 }
      });
      expect(Inventory.findByPk).toHaveBeenCalledWith(999);
      expect(res.json).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 1,
          order_id: 1,
          product_id: 999,
          quantity: 2,
          unit_price: 100,
          product_name: 'Ismeretlen termék'
        })
      ]);
    });
    
    it('should handle errors', async () => {
      req.params.orderId = 1;
      const error = new Error('Database error');
      OrderItem.findAll.mockRejectedValue(error);
      
      await orderItemsController.getOrderItemsByOrderId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Server error', 
        error: error.message 
      });
    });
  });
  
  describe('createOrderItem', () => {
    it('should create a new order item', async () => {
      const mockOrderItem = { 
        id: 1, 
        order_id: 1, 
        product_type: 'inventory',
        product_id: 1, 
        quantity: 2, 
        unit_price: 100 
      };
      
      req.body = { 
        order_id: 1, 
        product_id: 1, 
        quantity: 2, 
        unit_price: 100 
      };
      
      OrderItem.create.mockResolvedValue(mockOrderItem);
      
      await orderItemsController.createOrderItem(req, res);
      
      expect(OrderItem.create).toHaveBeenCalledWith({ 
        order_id: 1, 
        product_type: 'inventory',
        product_id: 1, 
        quantity: 2, 
        unit_price: 100 
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrderItem);
    });
    
    it('should return 400 if required fields are missing', async () => {
      req.body = { order_id: 1 };
      
      await orderItemsController.createOrderItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
      expect(OrderItem.create).not.toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      req.body = { 
        order_id: 1, 
        product_id: 1, 
        quantity: 2, 
        unit_price: 100 
      };
      
      const error = new Error('Database error');
      OrderItem.create.mockRejectedValue(error);
      
      await orderItemsController.createOrderItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Server error', 
        error: error.message 
      });
    });
  });
  
  describe('updateOrderItem', () => {
    it('should update an order item', async () => {
      const mockOrderItem = { 
        id: 1, 
        order_id: 1, 
        product_id: 1, 
        quantity: 2, 
        unit_price: 100,
        update: jest.fn().mockResolvedValue({ 
          id: 1, 
          order_id: 1, 
          product_id: 1, 
          quantity: 3, 
          unit_price: 120 
        })
      };
      
      req.params.id = 1;
      req.body = { 
        order_id: 1, 
        product_id: 1, 
        quantity: 3, 
        unit_price: 120 
      };
      
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);
      
      await orderItemsController.updateOrderItem(req, res);
      
      expect(OrderItem.findByPk).toHaveBeenCalledWith(1);
      expect(mockOrderItem.update).toHaveBeenCalledWith({ 
        order_id: 1, 
        product_type: 'inventory',
        product_id: 1, 
        quantity: 3, 
        unit_price: 120 
      });
      expect(res.json).toHaveBeenCalledWith(mockOrderItem);
    });
    
    it('should return 404 if order item not found', async () => {
      req.params.id = 999;
      OrderItem.findByPk.mockResolvedValue(null);
      
      await orderItemsController.updateOrderItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order item not found' });
    });
    
    it('should handle errors', async () => {
      req.params.id = 1;
      const error = new Error('Database error');
      OrderItem.findByPk.mockRejectedValue(error);
      
      await orderItemsController.updateOrderItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Server error', 
        error: error.message 
      });
    });
  });
  
  describe('deleteOrderItem', () => {
    it('should delete an order item', async () => {
      const mockOrderItem = { 
        id: 1, 
        order_id: 1, 
        product_id: 1, 
        quantity: 2, 
        unit_price: 100,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      
      req.params.id = 1;
      
      OrderItem.findByPk.mockResolvedValue(mockOrderItem);
      
      await orderItemsController.deleteOrderItem(req, res);
      
      expect(OrderItem.findByPk).toHaveBeenCalledWith(1);
      expect(mockOrderItem.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Order item deleted successfully' });
    });
    
    it('should return 404 if order item not found', async () => {
      req.params.id = 999;
      OrderItem.findByPk.mockResolvedValue(null);
      
      await orderItemsController.deleteOrderItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order item not found' });
    });
    
    it('should handle errors', async () => {
      req.params.id = 1;
      const error = new Error('Database error');
      OrderItem.findByPk.mockRejectedValue(error);
      
      await orderItemsController.deleteOrderItem(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Server error', 
        error: error.message 
      });
    });
  });
});