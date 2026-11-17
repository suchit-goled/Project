import React from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiStar, FiTruck, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";
import "./OtherSellersComparison.css";

const OtherSellersComparison = ({ offers = [], currentProductId }) => {
    const { addToCart } = useCart();

    const otherOffers = offers.filter((o) => o._id !== currentProductId);

    if (otherOffers.length === 0) return null;

    const handleAddOfferToCart = async (offer) => {
        try {
            await addToCart(offer._id, 1);
            toast.success(`Added ${offer.product_title || "item"} from ${offer.store?.name || "seller"} to cart`);
        } catch (err) {
            console.error("Failed to add offer to cart:", err);
            toast.error("Failed to add item to cart");
        }
    };

    return (
        <div className="other-sellers-box">
            <div className="other-sellers-header">
                <div className="other-sellers-badge">PRICE COMPARISON</div>
                <h3>Other Sellers on ElectroNova ({otherOffers.length})</h3>
                <p>Compare prices, ratings, and delivery speeds from other verified marketplace sellers.</p>
            </div>

            <div className="other-sellers-table-wrapper">
                <table className="other-sellers-table">
                    <thead>
                        <tr>
                            <th>Seller / Store</th>
                            <th>Rating</th>
                            <th>Price</th>
                            <th>Delivery</th>
                            <th>Stock</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {otherOffers.map((offer) => {
                            const store = offer.store || {};
                            const storeName = store.name || "ElectroNova Partner";
                            const storeSlug = store.slug || "";
                            const rating = store.rating || offer.product_rating || 4.5;
                            const inStock = (offer.stock ?? 25) > 0;
                            const deliveryMethod = offer.deliveryOptions?.supportsPlatformDelivery
                                ? "ElectroNova Fulfilled"
                                : "Seller Dispatch";

                            return (
                                <tr key={offer._id}>
                                    <td className="seller-name-cell">
                                        <div className="table-seller-title">
                                            {storeSlug ? (
                                                <Link to={`/stores/${storeSlug}`} className="store-link">
                                                    {storeName}
                                                </Link>
                                            ) : (
                                                <span className="store-link">{storeName}</span>
                                            )}
                                            {store.isVerified && (
                                                <FiCheckCircle className="verified-icon" title="Verified Seller" />
                                            )}
                                        </div>
                                        {store.pickupAddress?.city && (
                                            <span className="seller-city">{store.pickupAddress.city}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="table-rating">
                                            <FiStar className="star-icon" /> {rating.toFixed(1)}
                                        </span>
                                    </td>
                                    <td className="table-price-cell">
                                        <div className="table-price">
                                            ₹{(offer.discounted_price ?? offer.price ?? 0).toLocaleString()}
                                        </div>
                                        {offer.discount_percentage > 0 && (
                                            <span className="table-discount">
                                                {offer.discount_percentage}% OFF
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`table-delivery-pill ${offer.deliveryOptions?.supportsPlatformDelivery ? "platform" : "seller"}`}>
                                            <FiTruck /> {deliveryMethod}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`table-stock ${inStock ? "in" : "out"}`}>
                                            {inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="table-add-btn"
                                            onClick={() => handleAddOfferToCart(offer)}
                                            disabled={!inStock}
                                        >
                                            <FiShoppingCart /> Add
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OtherSellersComparison;
