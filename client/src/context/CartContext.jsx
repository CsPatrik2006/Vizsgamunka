import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : null;
  });
  
  const [cartItems, setCartItems] = useState(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });
  
  const [loading, setLoading] = useState(false);

  // Format price with thousand separator (for consistency)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('hu-HU').format(price);
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Save cartItems to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);

  // Fetch or create a cart for the user
  const initializeCart = async (userId, garageId) => {
    // Don't reinitialize if we already have a valid cart for this user
    if (cart && cart.user_id === userId) return;
    
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
        setCartItems([]);
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

  // Add item to cart with optimistic updates
  const addToCart = async (productType, productId, quantity) => {
    if (!cart) return;
    
    try {
      // Check if item already exists in cart
      const existingItem = cartItems.find(
        item => item.product_type === productType && item.product_id === productId
      );
      
      if (existingItem) {
        // Optimistically update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;
        
        // Update local state immediately for better UX
        const optimisticCartItems = cartItems.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: newQuantity } 
            : item
        );
        setCartItems(optimisticCartItems);
        
        // Then update on server
        setLoading(true);
        const updatedItem = await axios.put(`http://localhost:3000/cartItems/${existingItem.id}`, {
          cart_id: cart.id,
          product_type: productType,
          product_id: productId,
          quantity: newQuantity
        });
        
        // Update with server response (in case there were any changes)
        setCartItems(prevItems => prevItems.map(item => 
          item.id === existingItem.id ? {
            ...updatedItem.data,
            name: existingItem.name,
            price: existingItem.price
          } : item
        ));
      } else {
        // For new items, first get product details
        let productDetails = {};
        if (productType === 'inventory') {
          const productResponse = await axios.get(`http://localhost:3000/inventory/${productId}`);
          productDetails = {
            name: productResponse.data.item_name,
            price: productResponse.data.unit_price
          };
        }
        
        // Create a temporary item with a temporary ID
        const tempItem = {
          id: `temp-${Date.now()}`,
          cart_id: cart.id,
          product_type: productType,
          product_id: productId,
          quantity: quantity,
          ...productDetails
        };
        
        // Add to local state immediately
        setCartItems([...cartItems, tempItem]);
        
        // Then add to server
        setLoading(true);
        const newItem = await axios.post('http://localhost:3000/cartItems', {
          cart_id: cart.id,
          product_type: productType,
          product_id: productId,
          quantity: quantity
        });
        
        // Update with real ID from server
        setCartItems(prevItems => prevItems.map(item => 
          item.id === tempItem.id 
            ? { ...newItem.data, ...productDetails } 
            : item
        ));
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Revert to original state if there was an error
      fetchCartItems(cart.id);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart with optimistic updates
  const removeFromCart = async (itemId) => {
    // Optimistically remove from UI first
    const originalItems = [...cartItems];
    setCartItems(cartItems.filter(item => item.id !== itemId));
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/cartItems/${itemId}`);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // Revert to original state if there was an error
      setCartItems(originalItems);
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity with optimistic updates
  const updateCartItemQuantity = async (itemId, quantity) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;
    
    // Store original items for potential rollback
    const originalItems = [...cartItems];
    
    // Update optimistically
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
    
    try {
      setLoading(true);
      const updatedItem = await axios.put(`http://localhost:3000/cartItems/${itemId}`, {
        cart_id: item.cart_id,
        product_type: item.product_type,
        product_id: item.product_id,
        quantity: quantity
      });
      
      // Confirm update with server data
      setCartItems(prevItems => prevItems.map(item => 
        item.id === itemId ? {
          ...updatedItem.data,
          name: item.name,
          price: item.price
        } : item
      ));
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      // Revert to original state if there was an error
      setCartItems(originalItems);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart - modified to also clear localStorage
  const clearCart = async () => {
    if (!cart) return;
    
    // Store original items for potential rollback
    const originalItems = [...cartItems];
    
    // Clear items optimistically
    setCartItems([]);
    
    try {
      setLoading(true);
      
      // Delete all cart items from the backend
      await Promise.all(originalItems.map(item => 
        axios.delete(`http://localhost:3000/cartItems/${item.id}`)
      ));
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Revert to original state if there was an error
      setCartItems(originalItems);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout - clear cart data
  const handleCartLogout = async () => {
    try {
      // First clear any items in the cart
      if (cart && cartItems.length > 0) {
        await Promise.all(cartItems.map(item => 
          axios.delete(`http://localhost:3000/cartItems/${item.id}`)
        ));
      }
      
      // Clear cart data from localStorage
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      
      // Reset state
      setCart(null);
      setCartItems([]);
    } catch (error) {
      console.error('Error during cart logout:', error);
      // Still clear local state even if server operations fail
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      setCart(null);
      setCartItems([]);
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