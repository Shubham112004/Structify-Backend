const express = require('express');
const Stripe = require('stripe');
const verifyToken = require('../middlewares/verifyToken')
const nodemailer = require('nodemailer');
const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
    },
});

router.post('/create-checkout-session', verifyToken, async (req, res) => {
    const { products, grandTotal, userEmail } = req.body; // Include userEmail from frontend

    try {
        // Map products to Stripe's line_items format
        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price * 100,
            },
            quantity: product.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            success_url: `${process.env.FRONTEND_URL}`,
            cancel_url: `${process.env.FRONTEND_URL}`,
        });

        res.json({ url: session.url });

        // Listen for successful payments using Stripe Webhooks or immediately after session creation
        stripe.webhooks.events.on('checkout.session.completed', async (event) => {
            if (event.type === 'checkout.session.completed') {
                // Send an email with the bill
                const billHTML = `
                    <h1>Order Bill</h1>
                    <p>Thank you for your purchase!</p>
                    <table border="1" style="border-collapse: collapse; width: 100%;">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${product.quantity}</td>
                                    <td>$${product.price.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td colspan="2">Tax</td>
                                <td>$${(grandTotal - products.reduce((acc, p) => acc + p.price * p.quantity, 0)).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="2"><strong>Grand Total</strong></td>
                                <td><strong>$${grandTotal.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                `;

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: 'Your Order Bill',
                    html: billHTML,
                });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
