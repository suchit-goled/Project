export const welcomeEmailTemplate = (name) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body{
                font-family:Arial,sans-serif;
                background:#f5f5f5;
                padding:30px;
            }

            .container{
                max-width:600px;
                margin:auto;
                background:#fff;
                border-radius:12px;
                overflow:hidden;
                box-shadow:0 4px 15px rgba(0,0,0,.1);
            }

            .header{
                background:#2563eb;
                color:white;
                padding:25px;
                text-align:center;
            }

            .content{
                padding:30px;
                color:#444;
                line-height:1.7;
            }

            .button{
                display:inline-block;
                padding:12px 25px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:8px;
                margin-top:20px;
            }

            .footer{
                background:#fafafa;
                padding:20px;
                text-align:center;
                color:#777;
                font-size:14px;
            }

        </style>
    </head>

    <body>

        <div class="container">

            <div class="header">
                <h1>Welcome to ElectroNova 🎉</h1>
            </div>

            <div class="content">

                <h2>Hello ${name},</h2>

                <p>
                    Thank you for joining ElectroNova.
                </p>

                <p>
                    Your account has been created successfully.
                </p>

                <p>
                    Explore thousands of electronic products,
                    manage your wishlist,
                    track orders,
                    and enjoy secure online payments.
                </p>

                <a
                    class="button"
                    href="http://localhost:5173"
                >
                    Start Shopping
                </a>

            </div>

            <div class="footer">
                © 2026 ElectroNova
            </div>

        </div>

    </body>

    </html>
    `;
};