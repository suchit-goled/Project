import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "./styles/globals.css";
import "./styles/animations.css";
import { SearchProvider } from './context/SearchContext';
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from './context/WishlistContext';
import { DeliveryProvider } from './context/DeliveryContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 
   <SearchProvider>
    <AuthProvider>
        <DeliveryProvider>
            <WishlistProvider>
                <CartProvider>
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                </CartProvider>
            </WishlistProvider>
        </DeliveryProvider>
    </AuthProvider>
</SearchProvider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
