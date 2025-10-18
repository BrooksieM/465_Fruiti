// Services/sellerApplicationService.js
// Demo endpoints for a seller onboarding flow + subscription CRUD (in-memory)

module.exports = function (app, _supabase) {
    // In-memory subscription plans
    let subscriptions = [
      { id: 1, name: 'Monthly', price: 5.99, duration: '1 month' },
      { id: 2, name: '6mo',     price: 12.00, duration: '3 months' },
      { id: 3, name: 'Year',    price: 15.00, duration: '12 months' },
    ];
  
    // Entry page placeholder
    app.get('/api/seller_application', (_req, res) => {
      res.json({ message: 'This is the seller application page' });
    });
  
    // Get subscription plan by :id
    app.get('/api/seller_subscription/:id', (req, res) => {
      const id = Number(req.params.id);
      const plan = subscriptions.find((p) => p.id === id);
      if (!Number.isInteger(id) || id <= 0 || !plan) return res.status(404).json({ error: 'Subscription plan not found.' });
      res.status(200).json({ message: `Subscription plan details for ID: ${id}`, plan });
    });
  
    // Update subscription plan by :id (partial)
    app.put('/api/seller_subscription/:id', (req, res) => {
      const id = Number(req.params.id);
      const plan = subscriptions.find((p) => p.id === id);
      if (!Number.isInteger(id) || id <= 0 || !plan) return res.status(404).json({ error: 'Subscription plan not found.' });
      const { name, price, duration } = req.body || {};
      if (name !== undefined) plan.name = name;
      if (price !== undefined) plan.price = price;
      if (duration !== undefined) plan.duration = duration;
      res.json({ message: `Updated subscription plan ${id}`, plan });
    });
  
    // Delete subscription plan by :id
    app.delete('/api/seller_subscription/:id', (req, res) => {
      const id = Number(req.params.id);
      const ix = subscriptions.findIndex((p) => p.id === id);
      if (!Number.isInteger(id) || id <= 0 || ix === -1) return res.status(404).json({ error: 'Subscription plan not found.' });
      const [removed] = subscriptions.splice(ix, 1);
      res.json({ message: `Canceled subscription plan ${id}`, removed });
    });
  
    // Payment page placeholder
    app.get('/api/seller_payment', (_req, res) => {
      res.json({ message: 'This is the payment information page' });
    });
  };
  