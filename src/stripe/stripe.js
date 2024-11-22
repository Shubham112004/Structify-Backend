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

// Webhook endpoint for Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        // Verify Stripe webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Retrieve line items if needed
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // Construct and send the email
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
                    ${lineItems.data.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>$${(item.amount_total / 100).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Grand Total</strong></td>
                        <td><strong>$${(session.amount_total / 100).toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        `;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: session.customer_email, // Use customer_email from the session object
                subject: 'Your Order Bill',
                html: billHTML,
            });
            console.log('Bill sent successfully!');
        } catch (emailError) {
            console.error('Error sending bill:', emailError.message);
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});


module.exports = router;
