import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Cart data corruption:", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1, variant = null) => {
        setCartItems(prev => {
            // Check if cart is not empty and the new product is from a different restaurant
            if (prev.length > 0 && prev[0].restaurant_id !== product.restaurant_id) {
                const confirmed = window.confirm("Your cart contains products from another restaurant. Do you want to clear your cart and add this instead?");
                if (!confirmed) return prev;
                // If confirmed, treat the cart as empty
                const newItem = { ...product, quantity, variant, cart_item_id: `${product.id}${variant ? '-' + variant.id : ''}` };
                return [newItem];
            }

            const cartItemId = `${product.id}${variant ? '-' + variant.id : ''}`;
            const existing = prev.find(item => item.cart_item_id === cartItemId);
            
            if (existing) {
                return prev.map(item =>
                    item.cart_item_id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            
            return [...prev, { ...product, quantity, variant, cart_item_id: cartItemId }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCartItems(prev => prev.filter(item => item.cart_item_id !== cartItemId));
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return removeFromCart(cartItemId);
        setCartItems(prev =>
            prev.map(item => item.cart_item_id === cartItemId ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => setCartItems([]);

    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.variant ? parseFloat(item.variant.price) : parseFloat(item.price);
        return acc + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
