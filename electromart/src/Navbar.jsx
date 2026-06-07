import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    // SEARCH STATE
    const [search, setSearch] =
        useState("");

    // DROPDOWN MENU
    const [showMenu, setShowMenu] =
        useState(false);

    // SEARCH FUNCTION
    const handleSearch = () => {

        if (!search.trim()) {

            return;

        }

        navigate(
            `/products/search/${search}`
        );

    };

    return (

        <div className="navbar">

            {/* LOGO */}

            <h2
                className="logo"
                onClick={() =>
                    navigate("/")
                }
            >

                ⚡ ElectroNova

            </h2>

            {/* SEARCH BAR */}

            <div className="search-box">

                <input

                    type="text"

                    placeholder="Search products..."

                    value={search}

                    onChange={(e) =>
                        setSearch(e.target.value)
                    }

                    onKeyDown={(e) => {

                        if (e.key === "Enter") {

                            handleSearch();

                        }

                    }}

                />

                <button
                    onClick={handleSearch}
                >
                    🔍
                </button>

            </div>

            {/* RIGHT SIDE */}

            <div className="nav-right">

                {/* CART */}

                <button
                    className="nav-btn"
                    onClick={() =>
                        navigate("/cart")
                    }
                >
                    🛒 Cart
                </button>

                {/* MENU */}

                <div className="menu-container">

                    <button
                        className="menu-btn"
                        onClick={() =>
                            setShowMenu(!showMenu)
                        }
                    >
                        ⋮
                    </button>

                    {
                        showMenu && (

                            <div className="dropdown-menu">

                                {/* LOGIN */}

                                <button
                                    onClick={() => {

                                        navigate("/login");

                                        setShowMenu(false);

                                    }}
                                >
                                    🔐 Login
                                </button>

                                {/* PROFILE */}

                                <button
                                    onClick={() => {

                                        navigate("/profile");

                                        setShowMenu(false);

                                    }}
                                >
                                    👤 Profile
                                </button>

                                {/* ORDERS */}

                                <button
                                    onClick={() => {

                                        navigate("/orders");

                                        setShowMenu(false);

                                    }}
                                >
                                    📦 My Orders
                                </button>

                                {/* WISHLIST */}

                                <button
                                    onClick={() => {

                                        navigate("/wishlist");

                                        setShowMenu(false);

                                    }}
                                >
                                    ❤️ Wishlist
                                </button>

                            </div>

                        )
                    }

                </div>

            </div>

        </div>

    );

}

export default Navbar;