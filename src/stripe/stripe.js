const express = require('express');
const Stripe = require('stripe');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY);

router.post('/create-checkout-session', verifyToken, async (req, res) => {
    const { products, grandTotal } = req.body; // Extract products and grandTotal from request body

    try {
        // Map products to Stripe's line_items format
        const lineItems = products.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.name,
                },
                unit_amount: product.price * 100, // Convert price to cents
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

        // Respond with the session URL for redirection
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
