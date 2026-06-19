import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function Admin() {

    const navigate = useNavigate();

    /* DATABASE STATES */
    const [products, setProducts] = useState([]);
    const [carts, setCarts] = useState([]);
    const [users, setUsers] = useState([]);

    /* ADD PRODUCT STATES */
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState("");

    /* FETCH DATABASE DATA */
    useEffect(() => {

        // PRODUCTS
        axios.get("https://your-render-url.onrender.com/admin/products")
            .then((res) => {
                setProducts(res.data);
            })
            .catch((err) => console.log(err));

        // CARTS
        axios.get("https://your-render-url.onrender.com/admin/carts")
            .then((res) => {
                setCarts(res.data);
            })
            .catch((err) => console.log(err));

        // USERS
        axios.get("https://your-render-url.onrender.com/admin/users")
            .then((res) => {
                setUsers(res.data);
            })
            .catch((err) => console.log(err));

    }, []);

    /* LOGOUT */
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    /* ADD PRODUCT */
    const addProduct = async () => {

        try {

            await axios.post(
                "https://your-render-url.onrender.com/admin/add-product",
                {
                    product_title: title,
                    discounted_price: price,
                    product_category: category,
                    product_image_url: image
                }
            );

            alert("Product Added");

            setTitle("");
            setPrice("");
            setCategory("");
            setImage("");

            // refresh products
            const updated = await axios.get(
                "https://your-render-url.onrender.com/admin/products"
            );

            setProducts(updated.data);

        } catch (err) {

            console.log(err);

        }

    };

    /* DELETE PRODUCT */
    const deleteProduct = async (id) => {

        try {

            await axios.delete(
                `https://your-render-url.onrender.com/admin/delete-product/${id}`
            );

            alert("Product Deleted");

            setProducts(
                products.filter((p) => p._id !== id)
            );

        } catch (err) {

            console.log(err);

        }

    };

    /* DELETE USER */
    const deleteUser = async (id) => {

        try {

            await axios.delete(
                `https://your-render-url.onrender.com/admin/delete-user/${id}`
            );

            alert("User Deleted");

            setUsers(
                users.filter((u) => u._id !== id)
            );

        } catch (err) {

            console.log(err);

        }

    };

    /* UPDATE ROLE */
    const updateRole = async (id, role) => {

        try {

            await axios.put(
                `https://your-render-url.onrender.com/admin/update-role/${id}`,
                { role }
            );

            alert("Role Updated");

            setUsers(
                users.map((u) =>
                    u._id === id
                        ? { ...u, role }
                        : u
                )
            );

        } catch (err) {

            console.log(err);

        }

    };

    /* BAN USER */
    const banUser = async (id) => {

        try {

            await axios.put(
                `https://your-render-url.onrender.com/admin/ban-user/${id}`
            );

            alert("User Banned");

            setUsers(
                users.map((u) =>
                    u._id === id
                        ? { ...u, banned: true }
                        : u
                )
            );

        } catch (err) {

            console.log(err);

        }

    };



    return (

        <div className="admin-page">

            {/* SIDEBAR */}
            <div className="admin-sidebar">

                <h2>⚡ ElectroNova</h2>

                <button
                    onClick={() =>
                        document.getElementById("products")
                            .scrollIntoView({ behavior: "smooth" })
                    }
                >
                    📦 Manage Products
                </button>

                <button
                    className="admin-btn"
                    onClick={() =>
                        navigate("/admin-orders")
                    }
                >
                    📦 Manage Orders
                </button>

                <button
                    onClick={() =>
                        document.getElementById("users")
                            .scrollIntoView({ behavior: "smooth" })
                    }
                >
                    👥 Manage Users
                </button>

                <button
                    onClick={() =>
                        document.getElementById("reports")
                            .scrollIntoView({ behavior: "smooth" })
                    }
                >
                    📊 Reports
                </button>

            </div>


            {/* MAIN CONTENT */}
            <div className="admin-content">

                {/* TOPBAR */}
                <div className="admin-topbar">

                    <h1>Admin Dashboard</h1>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>


                {/* DASHBOARD CARDS */}
                <div className="dashboard-cards">

                    <div className="dashboard-card">
                        <h2>{products.length}</h2>
                        <p>Total Products</p>
                    </div>

                    <div className="dashboard-card">
                        <h2>{carts.length}</h2>
                        <p>Total Cart Items</p>
                    </div>

                    <div className="dashboard-card">
                        <h2>{users.length}</h2>
                        <p>Total Users</p>
                    </div>

                </div>


                {/* ADD PRODUCT */}
                <div className="add-product-box">

                    <h2>➕ Add Product</h2>

                    <input
                        type="text"
                        placeholder="Product Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Image URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    />

                    <button onClick={addProduct}>
                        Add Product
                    </button>

                </div>


                {/* PRODUCTS */}
                <div id="products" className="recent-section">

                    <h2>📦 Products ({products.length})</h2>

                    <div className="admin-scroll-box">

                        {products.slice(0, 50).map((p) => (

                            <div key={p._id} className="activity-box">

                                <img
                                    src={p.product_image_url}
                                    alt=""
                                    width="80"
                                />

                                <div>

                                    <p>
                                        <b>{p.product_title}</b>
                                    </p>

                                    <p>
                                        ₹{p.discounted_price}
                                    </p>

                                    <p>
                                        {p.product_category}
                                    </p>

                                    <div className="admin-product-buttons">

                                        <button className="edit-btn">
                                            ✏ Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteProduct(p._id)
                                            }
                                        >
                                            🗑 Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>


                {/* USERS */}
                <div id="users" className="recent-section">

                    <h2>👥 Users</h2>

                    {users.map((u) => {

                        // FILTER USER CARTS
                        const userCarts = carts.filter(
                            (c) => c.userId === u.username
                        );

                        return (

                            <div
                                key={u._id}
                                className="user-card"
                            >

                                {/* USER DETAILS */}
                                <div className="user-header">

                                    <div>

                                        <p>
                                            <b>{u.username}</b>
                                        </p>

                                        <p>
                                            Role: {u.role}
                                        </p>

                                        <p>
                                            Status:
                                            {u.banned
                                                ? " 🚫 Banned"
                                                : " ✅ Active"}
                                        </p>

                                    </div>


                                    {/* ACTION BUTTONS */}
                                    <div className="admin-product-buttons">

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                updateRole(u._id, "admin")
                                            }
                                        >
                                            👑 Make Admin
                                        </button>

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                updateRole(u._id, "user")
                                            }
                                        >
                                            👤 Make User
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                banUser(u._id)
                                            }
                                        >
                                            🚫 Ban
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteUser(u._id)
                                            }
                                        >
                                            🗑 Delete
                                        </button>

                                    </div>

                                </div>


                                {/* USER CART ITEMS */}
                                <div className="user-cart-section">

                                    <h4>
                                        🛒 Cart Items ({userCarts.length})
                                    </h4>

                                    {userCarts.length === 0 ? (

                                        <p>No cart items</p>

                                    ) : (

                                        userCarts.map((c) => (

                                            <div
                                                key={c._id}
                                                className="cart-item-box"
                                            >

                                                <img
                                                    src={c.product?.product_image_url}
                                                    alt=""
                                                    width="70"
                                                />

                                                <div>

                                                    <p>
                                                        <b>
                                                            {c.product?.product_title}
                                                        </b>
                                                    </p>

                                                    <p>
                                                        ₹{c.product?.discounted_price}
                                                    </p>

                                                    <p>
                                                        Quantity: {c.quantity}
                                                    </p>

                                                </div>

                                            </div>

                                        ))

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>


                {/* REPORTS */}
                {/* REPORTS */}
                <div id="reports" className="recent-section">

                    <h2>📊 Sales Reports & Analytics</h2>

                    {/* REPORT CARDS */}
                    <div className="report-cards">

                        <div className="report-card">
                            <h3>Total Products</h3>
                            <p>{products.length}</p>
                        </div>

                        <div className="report-card">
                            <h3>Total Users</h3>
                            <p>{users.length}</p>
                        </div>

                        <div className="report-card">
                            <h3>Total Cart Items</h3>
                            <p>{carts.length}</p>
                        </div>

                        <div className="report-card">
                            <h3>Total Revenue</h3>

                            <p>
                                ₹{
                                    carts.reduce(
                                        (total, item) =>
                                            total +
                                            (
                                                Number(
                                                    item.product?.discounted_price ||
                                                    item.discounted_price ||
                                                    0
                                                ) *
                                                Number(item.quantity || 1)
                                            ),
                                        0
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* RECENT SALES */}
                    <div className="sales-table">

                        <h3>🛒 Recent Sales</h3>

                        <table>

                            <thead>

                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>User</th>
                                </tr>

                            </thead>

                            <tbody>

                                {carts.slice(0, 10).map((item) => (

                                    <tr key={item._id}>

                                        <td>
                                            {
                                                item.product?.product_title ||
                                                item.product_title
                                            }
                                        </td>

                                        <td>
                                            ₹{
                                                item.product?.discounted_price ||
                                                item.discounted_price
                                            }
                                        </td>

                                        <td>
                                            {item.quantity}
                                        </td>

                                        <td>
                                            {item.userId}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>


                    {/* TOP PRODUCTS */}
                    <div className="top-products">

                        <h3>🔥 Top Products</h3>

                        <div className="top-products-grid">

                            {products.slice(0, 6).map((p) => (

                                <div
                                    key={p._id}
                                    className="top-product-card"
                                >

                                    <img
                                        src={p.product_image_url}
                                        alt=""
                                    />

                                    <h4>
                                        {p.product_title}
                                    </h4>

                                    <p>
                                        ₹{p.discounted_price}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Admin;