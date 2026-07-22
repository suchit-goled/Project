import { useCart } from "../context/CartContext";

import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";

import "./Cart.css";

const Cart = () => {

    const { cart, loading } = useCart();

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!cart.length) {

        return <EmptyCart />;

    }

    return (

        <section className="cart-page container">

            <div className="cart-left">

                {cart.map(item => (

                    <CartItem
                        key={item.productId._id}
                        item={item}
                    />

                ))}

            </div>

            <div className="cart-right">

                <CartSummary />

            </div>

        </section>

    );

};

export default Cart;