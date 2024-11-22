const { requireAuth } = require('@clerk/clerk-sdk-node');

// Example: Protecting a route that requires authentication
app.get('/protected', requireAuth(), (req, res) => {
    res.send('This is a protected route!');
});
