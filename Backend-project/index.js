// ==============================
// IMPORTS
// ==============================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// ==============================
// DATABASE CONNECTION
// ==============================
console.log(process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Atlas Connected");
  })
  .catch((err) => {
    console.log("❌ Atlas Error");
    console.log(err);
  });

// ==============================
// PRODUCT SCHEMA
// ==============================

const productSchema = new mongoose.Schema({

  product_title: String,
  product_rating: Number,
  total_reviews: Number,
  discounted_price: Number,
  original_price: Number,
  product_image_url: String,
  product_category: String,
  discount_percentage: Number,
  isFeatured: Boolean

});

const Product = mongoose.model(
  "Product",
  productSchema,
  "products"
);

// ==============================
// USER SCHEMA
// ==============================

const userSchema = new mongoose.Schema({

  username: String,

  password: String,

  role: {
    type: String,
    default: "user"
  },

  banned: {
    type: Boolean,
    default: false
  }

});

const User = mongoose.model(
  "User",
  userSchema
);

// ==============================
// CART SCHEMA
// ==============================

const cartSchema = new mongoose.Schema({

  userId: String,

  productId: String,

  title: String,

  price: Number,

  image: String,

  quantity: {
    type: Number,
    default: 1
  }

});

const Cart = mongoose.model(
  "Cart",
  cartSchema
);

// ==============================
// ORDER SCHEMA
// ==============================

const orderSchema = new mongoose.Schema({

  userId: String,

  items: Array,

  name: String,

  email: String,

  phone: String,

  address: String,

  city: String,

  state: String,

  pincode: String,

  payment: String,

  status: String

});

const Order = mongoose.model(
  "Order",
  orderSchema
);

// ==============================
// PRODUCTS APIs
// ==============================

// GET ALL PRODUCTS
app.get("/products", async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 20;

    const data = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments();

    res.json({
      data,
      total
    });

  } catch (err) {

    console.log(err);

  }

});

// FEATURED PRODUCTS
app.get("/featured-products", async (req, res) => {

  const data = await Product.find({
    isFeatured: true
  }).limit(10);

  res.json(data);

});

// SINGLE PRODUCT
app.get("/products/:id", async (req, res) => {

  try {

    const product = await Product.findById(
      req.params.id
    );

    res.json(product);

  } catch (err) {

    console.log(err);

  }

});

// CATEGORY PRODUCTS
app.get("/products/category/:category", async (req, res) => {

  try {

    const data = await Product.find({

      product_category: {
        $regex: new RegExp(
          `^${req.params.category}$`,
          "i"
        )
      }

    });

    res.json(data);

  } catch (err) {

    console.log(err);

  }

});

// SEARCH PRODUCTS
app.get("/products/search/:key", async (req, res) => {

  try {

    const key = req.params.key;

    const data = await Product.find({

      $or: [

        {
          product_title: {
            $regex: key,
            $options: "i"
          }
        },

        {
          product_category: {
            $regex: key,
            $options: "i"
          }
        }

      ]

    });

    res.json(data);

  } catch (err) {

    console.log(err);

  }

});

// RELATED PRODUCTS
app.get("/products/related/:id", async (req, res) => {

  try {

    const current = await Product.findById(
      req.params.id
    );

    const words = current.product_title
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 3);

    const regex = new RegExp(
      words.join("|"),
      "i"
    );

    const data = await Product.find({

      _id: {
        $ne: req.params.id
      },

      $or: [

        {
          product_title: {
            $regex: regex
          }
        },

        {
          product_category:
            current.product_category
        }

      ]

    }).limit(6);

    res.json(data);

  } catch (err) {

    console.log(err);

  }

});

// ==============================
// SIGNUP
// ==============================

app.post("/signup", async (req, res) => {

  const { username, password } = req.body;

  const existing = await User.findOne({
    username
  });

  if (existing) {

    return res.send(
      "User already exists"
    );

  }

  await User.create({

    username,
    password,
    role: "user"

  });

  res.send("Signup Successful");

});

// ==============================
// LOGIN
// ==============================

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  // ADMIN LOGIN
  if (
    username === "admin" &&
    password === "admin123"
  ) {

    return res.json({

      success: true,

      userId: "admin001",

      username: "admin",

      role: "admin"

    });

  }

  // USER LOGIN
  const user = await User.findOne({

    username,
    password

  });

  if (!user) {

    return res.json({
      success: false
    });

  }

  res.json({

    success: true,

    userId: user._id,

    username: user.username,

    role: user.role

  });

});

// ==============================
// USER PROFILE
// ==============================

app.get("/user/:id", async (req, res) => {

  try {

    const user = await User.findById(
      req.params.id
    );

    res.json(user);

  } catch (err) {

    console.log(err);

  }

});

// ==============================
// CART APIs
// ==============================

// ADD TO CART
app.post("/add-to-cart", async (req, res) => {

  try {

    const { userId, product } = req.body;

    const existing = await Cart.findOne({

      userId,

      productId: product._id

    });

    if (existing) {

      existing.quantity += 1;

      await existing.save();

      return res.send(
        "Quantity Updated"
      );

    }

    const newItem = new Cart({

      userId,

      productId: product._id,

      title: product.product_title,

      price: product.discounted_price,

      image: product.product_image_url

    });

    await newItem.save();

    res.send("Added To Cart");

  } catch (err) {

    console.log(err);

  }

});

// GET CART
app.get("/cart/:userId", async (req, res) => {

  const data = await Cart.find({

    userId: req.params.userId

  });

  res.json(data);

});

// INCREASE QUANTITY
app.put("/cart/increase", async (req, res) => {

  const { userId, productId } = req.body;

  const item = await Cart.findOne({

    userId,
    productId

  });

  item.quantity += 1;

  await item.save();

  res.send("Increased");

});

// DECREASE QUANTITY
app.put("/cart/decrease", async (req, res) => {

  const { userId, productId } = req.body;

  const item = await Cart.findOne({

    userId,
    productId

  });

  if (item.quantity > 1) {

    item.quantity -= 1;

    await item.save();

  } else {

    await Cart.deleteOne({

      userId,
      productId

    });

  }

  res.send("Updated");

});

// REMOVE ITEM
app.delete("/cart/remove", async (req, res) => {

  try {

    const { userId, productId } = req.body;

    await Cart.deleteOne({

      userId,
      productId

    });

    res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

  }

});

// ==============================
// PLACE ORDER
// ==============================

app.post("/place-order", async (req, res) => {

  try {

    const newOrder = new Order(req.body);

    await newOrder.save();

    res.json({

      success: true,
      message: "Order Placed"

    });

  } catch (err) {

    console.log(err);

  }

});

// ==============================
// GET ORDERS
// ==============================

app.get("/orders/:userId", async (req, res) => {

  try {

    const orders = await Order.find({

      userId: req.params.userId

    });

    res.json(orders);

  } catch (err) {

    console.log(err);

  }

});

// ==============================
// CANCEL ORDER
// ==============================

app.delete("/orders/:id", async (req, res) => {

  try {

    await Order.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.log(err);

  }

});

// ==============================
// ADMIN APIs
// ==============================

// GET PRODUCTS
app.get("/admin/products", async (req, res) => {

  const data = await Product.find();

  res.json(data);

});

// GET USERS
app.get("/admin/users", async (req, res) => {

  const data = await User.find();

  res.json(data);

});

// GET CARTS
app.get("/admin/carts", async (req, res) => {

  const data = await Cart.find();

  res.json(data);

});

// ADD PRODUCT
app.post("/admin/add-product", async (req, res) => {

  const product = new Product(req.body);

  await product.save();

  res.send("Product Added");

});

// UPDATE PRODUCT
app.put("/admin/update-product/:id", async (req, res) => {

  await Product.findByIdAndUpdate(

    req.params.id,
    req.body

  );

  res.send("Updated");

});

// DELETE PRODUCT
app.delete("/admin/delete-product/:id", async (req, res) => {

  await Product.findByIdAndDelete(
    req.params.id
  );

  res.send("Deleted");

});

// DELETE USER
app.delete("/admin/delete-user/:id", async (req, res) => {

  await User.findByIdAndDelete(
    req.params.id
  );

  res.send("User Deleted");

});

// UPDATE ROLE
app.put("/admin/update-role/:id", async (req, res) => {

  await User.findByIdAndUpdate(

    req.params.id,

    {
      role: req.body.role
    }

  );

  res.send("Role Updated");

});

// BAN USER
app.put("/admin/ban-user/:id", async (req, res) => {

  await User.findByIdAndUpdate(

    req.params.id,

    {
      banned: true
    }

  );

  res.send("User Banned");

});

app.get("/all-orders", async (req, res) => {

  try {

    const orders =
      await Order.find()
        .sort({ _id: -1 });

    res.json(orders);

  }

  catch (err) {

    console.log(err);

    res.status(500).json({
      success: false
    });

  }

});

app.put(
  "/update-order-status/:id",

  async (req, res) => {

    try {

      await Order.findByIdAndUpdate(

        req.params.id,

        {
          status: req.body.status
        }

      );

      res.send(
        "Order Updated"
      );

    } catch (err) {

      console.log(err);

    }

  }
);


// ==============================
// SERVER
// ==============================

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server Running On ${PORT}`);
});

