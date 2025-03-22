import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch or create a cart for the user
  const initializeCart = async (userId, garageId) => {
    try {
      setLoading(true);
      // Check if user already has a cart
      const response = await axios.get(`http://localhost:3000/cart`);
      const userCarts = response.data.filter(cart => cart.user_id === userId);
      
      if (userCarts.length > 0) {
        setCart(userCarts[0]);
        // Fetch cart items for this cart
        await fetchCartItems(userCarts[0].id);
      } else {
        // Create a new cart for the user
        const newCartResponse = await axios.post('http://localhost:3000/cart', {
          user_id: userId,
          garage_id: garageId
        });
        setCart(newCartResponse.data);
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart items
  const fetchCartItems = async (cartId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/cartItems`);
      const items = response.data.filter(item => item.cart_id === cartId);
      
      // Fetch product details for each cart item
      const itemsWithDetails = await Promise.all(items.map(async (item) => {
        if (item.product_type === 'inventory') {
          const productResponse = await axios.get(`http://localhost:3000/inventory/${item.product_id}`);
          return {
            ...item,
            name: productResponse.data.item_name,
            price: productResponse.data.unit_price,
          };
        }
        // Handle service products if needed
        return item;
      }));
      
      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productType, productId, quantity) => {
    if (!cart) return;
    
    try {
      setLoading(true);
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        item => item.product_type === productType && item.product_id === productId
      );
      
      if (existingItem) {
        // Update quantity if item exists
        const updatedItem = await axios.put(`http://localhost:3000/cartItems/${existingItem.id}`, {
          cart_id: cart.id,
          product_type: productType,
          product_id: productId,
          quantity: existingItem.quantity + quantity
        });
        
        // Update local state
        setCartItems(cartItems.map(item => 
          item.id === existingItem.id ? {
            ...updatedItem.data,
            name: existingItem.name,
            price: existingItem.price
          } : item
        ));
      } else {
        // Add new item to cart
        const newItem = await axios.post('http://localhost:3000/cartItems', {
          cart_id: cart.id,
          product_type: productType,
          product_id: productId,
          quantity: quantity
        });
        
        // Fetch product details
        let productDetails = {};
        if (productType === 'inventory') {
          const productResponse = await axios.get(`http://localhost:3000/inventory/${productId}`);
          productDetails = {
            name: productResponse.data.item_name,
            price: productResponse.data.unit_price
          };
        }
        
        // Add to local state
        setCartItems([...cartItems, { ...newItem.data, ...productDetails }]);
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/cartItems/${itemId}`);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      const updatedItem = await axios.put(`http://localhost:3000/cartItems/${itemId}`, {
        cart_id: item.cart_id,
        product_type: item.product_type,
        product_id: item.product_id,
        quantity: quantity
      });
      
      setCartItems(cartItems.map(item => 
        item.id === itemId ? {
          ...updatedItem.data,
          name: item.name,
          price: item.price
        } : item
      ));
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart - new function for checkout
  const clearCart = async () => {
    try {
      setLoading(true);
      if (!cart) return;
      
      // Delete all cart items from the backend
      await Promise.all(cartItems.map(item => 
        axios.delete(`http://localhost:3000/cartItems/${item.id}`)
      ));
      
      // Clear local state
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
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
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);