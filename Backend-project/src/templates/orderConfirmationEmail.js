export const orderConfirmationTemplate = (order, user) => {

  const items = order.products
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #ddd;">
          ${item.title}
        </td>

        <td style="padding:10px;border-bottom:1px solid #ddd;text-align:center;">
          ${item.quantity}
        </td>

        <td style="padding:10px;border-bottom:1px solid #ddd;text-align:right;">
          ₹${item.price.toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>

<style>

body{
font-family:Arial,sans-serif;
background:#f5f5f5;
padding:20px;
}

.container{
max-width:700px;
margin:auto;
background:#fff;
border-radius:10px;
overflow:hidden;
box-shadow:0 5px 20px rgba(0,0,0,.1);
}

.header{
background:#0f172a;
color:white;
padding:25px;
text-align:center;
}

.content{
padding:30px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th,td{
padding:12px;
border-bottom:1px solid #ddd;
}

.footer{
background:#fafafa;
padding:20px;
text-align:center;
color:#777;
}

.button{
display:inline-block;
padding:12px 25px;
background:#2563eb;
color:white !important;
text-decoration:none;
border-radius:8px;
margin-top:20px;
}

.summary{
margin-top:25px;
background:#f8fafc;
padding:15px;
border-radius:8px;
}

</style>

</head>

<body>

<div class="container">

<div class="header">
<h1>ElectroNova</h1>
<p>Your Order has been Confirmed 🎉</p>
</div>

<div class="content">

<h2>Hello ${user.name},</h2>

<p>Thank you for shopping with ElectroNova.</p>

<p>Your order has been placed successfully.</p>

<p><strong>Order ID:</strong> ${order._id}</p>

<table>

<thead>

<tr>

<th align="left">Product</th>

<th align="center">Qty</th>

<th align="right">Price</th>

</tr>

</thead>

<tbody>

${items}

</tbody>

</table>

<div class="summary">

<p><strong>Subtotal:</strong> ₹${order.subtotal.toLocaleString()}</p>

<p><strong>Shipping:</strong> ₹${order.shippingCharge.toLocaleString()}</p>

<p><strong>GST:</strong> ₹${order.tax.toLocaleString()}</p>

<h2>Total: ₹${order.total.toLocaleString()}</h2>

<p><strong>Payment:</strong> ${order.paymentMethod}</p>

<p><strong>Status:</strong> ${order.orderStatus}</p>

</div>

<a href="http://localhost:5173/orders" class="button">
Track My Order
</a>

</div>

<div class="footer">

© ${new Date().getFullYear()} ElectroNova

</div>

</div>

</body>

</html>
`;

};