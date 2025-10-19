// SELLER_APPLICATION SERVICE //////////////////////////////////

let subscriptions = [
    { id: 1, name: 'Monthly', price: 5.99, duration: '1 month' },
    { id: 2, name: '6mo', price: 12.00, duration: '3 months' },
    { id: 3, name: 'Year', price: 15.00, duration: '12 months' },
];


//view application of becoming a seller
app.get('/api/seller_application', (req, res) => {
    res.send('This is the seller application page');
});

//selecting subscription plan / 3
app.get('/api/seller_subscription/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const plan = subscriptions.find((p) => p.id === id);

    if (!plan) return res.status(404).json({ error: 'Subscription plan not found.' });

    res.status(200).json({
        message: `Subscription plan details for ID: ${id}`,
        plan,
    });
});


//inputting payment information
app.get('/api/seller_payment', (req, res) => {
    res.send('This is the payment information page');
});

//updating sub plan
app.put('/api/seller_subscription/:id', (req, res) => {
    const id = req.params.id;
    res.send(`This is the update subscription plan page for plan ID: ${id}`);
});

//cancelling sub plan
app.delete('/api/seller_subscription/:id', (req, res) => {
    const id = req.params.id;
    res.send(`This is the cancel subscription plan page for plan ID: ${id}`);
});

//choosing a specific plan
app.get('/api/seller_subscription/:id', (req, res) => {
    const id = req.params.id;
    res.send(`This is the subscription plan page for plan ID: ${id}`);
});



////////////////////////END OF SELLER APP///////////////