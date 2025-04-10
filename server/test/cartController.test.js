const cartController = require('../Controller/cartController');
const Cart = require('../model/cart');

jest.mock('../model/cart', () => {
  return {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  };
});

describe('Cart Controller', () => {
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
        { id: 1, user_id: 1, garage_id: 1 },
        { id: 2, user_id: 1, garage_id: 2 }
      ];

      Cart.findAll.mockResolvedValue(mockCartItems);

      await cartController.getAllCartItems(req, res);

      expect(Cart.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCartItems);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      Cart.findAll.mockRejectedValue(error);

      await cartController.getAllCartItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: error.message
      });
    });
  });

  describe('getCartItemById', () => {
    it('should return a cart item by id', async () => {
      const mockCartItem = { id: 1, user_id: 1, garage_id: 1 };
      req.params.id = 1;

      Cart.findByPk.mockResolvedValue(mockCartItem);

      await cartController.getCartItemById(req, res);

      expect(Cart.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockCartItem);
    });

    it('should return 404 if cart item not found', async () => {
      req.params.id = 999;
      Cart.findByPk.mockResolvedValue(null);

      await cartController.getCartItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
    });

    it('should handle errors', async () => {
      req.params.id = 1;
      const error = new Error('Database error');
      Cart.findByPk.mockRejectedValue(error);

      await cartController.getCartItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: error.message
      });
    });
  });

  describe('createCartItem', () => {
    it('should create a new cart item', async () => {
      const mockCartItem = { id: 1, user_id: 1, garage_id: 1 };
      req.body = { user_id: 1, garage_id: 1 };

      Cart.create.mockResolvedValue(mockCartItem);

      await cartController.createCartItem(req, res);

      expect(Cart.create).toHaveBeenCalledWith({ user_id: 1, garage_id: 1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCartItem);
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { user_id: 1 };

      await cartController.createCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Missing required fields (user_id, garage_id)'
      });
      expect(Cart.create).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      req.body = { user_id: 1, garage_id: 1 };
      const error = new Error('Database error');
      Cart.create.mockRejectedValue(error);

      await cartController.createCartItem(req, res);

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
        user_id: 1,
        garage_id: 1,
        update: jest.fn().mockResolvedValue({ id: 1, user_id: 2, garage_id: 2 })
      };
      req.params.id = 1;
      req.body = { user_id: 2, garage_id: 2 };

      Cart.findByPk.mockResolvedValue(mockCartItem);

      await cartController.updateCartItem(req, res);

      expect(Cart.findByPk).toHaveBeenCalledWith(1);
      expect(mockCartItem.update).toHaveBeenCalledWith({ user_id: 2, garage_id: 2 });
      expect(res.json).toHaveBeenCalledWith(mockCartItem);
    });

    it('should return 404 if cart item not found', async () => {
      req.params.id = 999;
      Cart.findByPk.mockResolvedValue(null);

      await cartController.updateCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
    });

    it('should handle errors', async () => {
      req.params.id = 1;
      const error = new Error('Database error');
      Cart.findByPk.mockRejectedValue(error);

      await cartController.updateCartItem(req, res);

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
        user_id: 1,
        garage_id: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      req.params.id = 1;

      Cart.findByPk.mockResolvedValue(mockCartItem);

      await cartController.deleteCartItem(req, res);

      expect(Cart.findByPk).toHaveBeenCalledWith(1);
      expect(mockCartItem.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart item deleted successfully' });
    });

    it('should return 404 if cart item not found', async () => {
      req.params.id = 999;
      Cart.findByPk.mockResolvedValue(null);

      await cartController.deleteCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found' });
    });

    it('should handle errors', async () => {
      req.params.id = 1;
      const error = new Error('Database error');
      Cart.findByPk.mockRejectedValue(error);

      await cartController.deleteCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: error.message
      });
    });
  });
});