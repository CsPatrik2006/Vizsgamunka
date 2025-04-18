import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : null;
  });
  
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  
  const [loading, setLoading] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  useEffect(() => {
    if (cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);

  const initializeCart = async (userId, garageId) => {
    if (cart && cart.user_id === userId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/cart`);
      const userCarts = response.data.filter(cart => cart.user_id === userId);
      
      if (userCarts.length > 0) {
        setCart(userCarts[0]);
        await fetchCartItems(userCarts[0].id);
      } else {
        const newCartResponse = await axios.post('http://localhost:3000/cart', {
          user_id: userId,
          garage_id: garageId
        });
        setCart(newCartResponse.data);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async (cartId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/cartItems`);
      const items = response.data.filter(item => item.cart_id === cartId);

      const itemsWithDetails = await Promise.all(items.map(async (item) => {
        const productResponse = await axios.get(`http://localhost:3000/inventory/${item.product_id}`);
        return {
          ...item,
          name: productResponse.data.item_name,
          price: productResponse.data.unit_price,
        };
      }));
      
      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    if (!cart) return false;
    
    try {
      const inventoryResponse = await axios.get(`http://localhost:3000/inventory/${productId}`);
      const inventoryItem = inventoryResponse.data;
      
      const existingItem = cartItems.find(
        item => item.product_id === productId
      );
      
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;
      
      if (totalRequestedQuantity > inventoryItem.quantity) {
        alert(`Csak ${inventoryItem.quantity} darab áll rendelkezésre ebből a termékből.`);
        return false;
      }
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        const optimisticCartItems = cartItems.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: newQuantity } 
            : item
        );
        setCartItems(optimisticCartItems);
        
        setLoading(true);
        const updatedItem = await axios.put(`http://localhost:3000/cartItems/${existingItem.id}`, {
          cart_id: cart.id,
          product_type: 'inventory',
          product_id: productId,
          quantity: newQuantity
        });
        
        setCartItems(prevItems => prevItems.map(item => 
          item.id === existingItem.id ? {
            ...updatedItem.data,
            name: existingItem.name,
            price: existingItem.price
          } : item
        ));
        
        return true;
      } else {
        const productResponse = await axios.get(`http://localhost:3000/inventory/${productId}`);
        const productDetails = {
          name: productResponse.data.item_name,
          price: productResponse.data.unit_price
        };
        
        const tempItem = {
          id: `temp-${Date.now()}`,
          cart_id: cart.id,
          product_type: 'inventory',
          product_id: productId,
          quantity: quantity,
          ...productDetails
        };
        
        setCartItems([...cartItems, tempItem]);
        
        setLoading(true);
        const newItem = await axios.post('http://localhost:3000/cartItems', {
          cart_id: cart.id,
          product_type: 'inventory',
          product_id: productId,
          quantity: quantity
        });
        
        setCartItems(prevItems => prevItems.map(item => 
          item.id === tempItem.id 
            ? { ...newItem.data, ...productDetails } 
            : item
        ));
        
        return true;
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      fetchCartItems(cart.id);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    const originalItems = [...cartItems];
    setCartItems(cartItems.filter(item => item.id !== itemId));
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/cartItems/${itemId}`);
      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setCartItems(originalItems);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return false;
    
    try {
      const inventoryResponse = await axios.get(`http://localhost:3000/inventory/${item.product_id}`);
      const inventoryItem = inventoryResponse.data;
      
      if (quantity > inventoryItem.quantity) {
        alert(`Csak ${inventoryItem.quantity} darab áll rendelkezésre ebből a termékből.`);
        return false;
      }
      
      const originalItems = [...cartItems];
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
      
      setLoading(true);
      const updatedItem = await axios.put(`http://localhost:3000/cartItems/${itemId}`, {
        cart_id: item.cart_id,
        product_type: 'inventory',
        product_id: item.product_id,
        quantity: quantity
      });
      
      setCartItems(prevItems => prevItems.map(item => 
        item.id === itemId ? {
          ...updatedItem.data,
          name: item.name,
          price: item.price
        } : item
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      setCartItems(originalItems);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!cart) return false;
    
    const originalItems = [...cartItems];
    
    setCartItems([]);
    
    try {
      setLoading(true);
      
      await Promise.all(originalItems.map(item => 
        axios.delete(`http://localhost:3000/cartItems/${item.id}`)
      ));
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCartItems(originalItems);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCartLogout = async () => {
    try {
      if (cart && cartItems.length > 0) {
        await Promise.all(cartItems.map(item => 
          axios.delete(`http://localhost:3000/cartItems/${item.id}`)
        ));
      }
      
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      
      setCart(null);
      setCartItems([]);
      
      return true;
    } catch (error) {
      console.error('Error during cart logout:', error);
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      setCart(null);
      setCartItems([]);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      loading,
      initializeCart,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      fetchCartItems,
      clearCart,
      handleCartLogout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);