// Services/sellerApplicationService.js

module.exports = function (app, supabase) 
{
  // GET /api/seller_subscriptions -> get all subscription plans
  app.get('/api/seller_subscriptions', async (req, res) => 
  {
    try 
    {
      const { data, error } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .order('price', { ascending: true });

      if (error) 
      {
        console.error('Subscriptions query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        count: data.length,
        subscriptions: data
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/seller_subscriptions/:id -> get specific subscription plan
  app.get('/api/seller_subscriptions/:id', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);
      
      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }

      const { data, error } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) 
      {
        if (error.code === 'PGRST116') 
        {
          return res.status(404).json({ error: 'Subscription plan not found' });
        }
        console.error('Subscription query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        message: `Subscription plan details for ID: ${id}`,
        plan: data
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/seller_subscriptions -> create new subscription plan (admin)
  app.post('/api/seller_subscriptions', async (req, res) => 
  {
    try 
    {
      const { name, price, duration, description } = req.body;

      // Validate required fields
      if (!name || price === undefined || !duration) 
      {
        return res.status(400).json({ 
          error: 'Name, price, and duration are required' 
        });
      }

      const { data, error } = await supabase
        .from('seller_subscriptions')
        .insert([
          {
            name,
            price,
            duration,
            description: description || '',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) 
      {
        console.error('Insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({
        message: 'Subscription plan created successfully',
        plan: data[0]
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/seller_subscriptions/:id -> update subscription plan
  app.put('/api/seller_subscriptions/:id', async (req, res) =>
  {
    try 
    {
      const id = Number(req.params.id);
      const { name, price, duration, description } = req.body;

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }

      // Check if subscription exists
      const { data: existingPlan, error: checkError } = await supabase
        .from('seller_subscriptions')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const { data, error } = await supabase
        .from('seller_subscriptions')
        .update({
          name,
          price,
          duration,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) 
      {
        console.error('Update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        message: 'Subscription plan updated successfully',
        plan: data[0]
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/seller_subscriptions/:id -> delete subscription plan
  app.delete('/api/seller_subscriptions/:id', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }

      // Check if subscription exists
      const { data: existingPlan, error: checkError } = await supabase
        .from('seller_subscriptions')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      const { error } = await supabase
        .from('seller_subscriptions')
        .delete()
        .eq('id', id);

      if (error) 
      {
        console.error('Delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ 
        message: 'Subscription plan deleted successfully',
        deletedId: id
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== SELLER APPLICATIONS ==========

  // POST /api/seller_applications -> submit seller application
  app.post('/api/seller_applications', async (req, res) => 
  {
    try 
    {
      const { userId, businessName, businessType, description, subscriptionPlanId } = req.body;

      // Validate required fields
      if (!userId || !businessName || !businessType || !subscriptionPlanId) 
      {
        return res.status(400).json({ 
          error: 'User ID, business name, business type, and subscription plan are required' 
        });
      }

      const { data, error } = await supabase
        .from('seller_applications')
        .insert([
          {
            user_id: userId,
            business_name: businessName,
            business_type: businessType,
            description: description || '',
            subscription_plan_id: subscriptionPlanId,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) 
      {
        console.error('Application insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({
        message: 'Seller application submitted successfully',
        application: data[0]
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/seller_application -> view seller application page (placeholder)
  app.get('/api/seller_application', (req, res) => 
  {
    res.json({ 
      message: 'This is the seller application page',
      instructions: 'Use POST /api/seller_applications to submit an application'
    });
  });

  // ========== PAYMENT INFORMATION ==========

  // POST /api/seller_payments -> submit payment information
  app.post('/api/seller_payments', async (req, res) => 
  {
    try 
    {
      const { applicationId, paymentMethod, paymentDetails } = req.body;

      if (!applicationId || !paymentMethod) 
      {
        return res.status(400).json({ 
          error: 'Application ID and payment method are required' 
        });
      }

      const { data, error } = await supabase
        .from('seller_payments')
        .insert([
          {
            application_id: applicationId,
            payment_method: paymentMethod,
            payment_details: paymentDetails || {},
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) 
      {
        console.error('Payment insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({
        message: 'Payment information submitted successfully',
        payment: data[0]
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/seller_payment -> view payment page (placeholder)
  app.get('/api/seller_payment', (req, res) => 
  {
    res.json({ 
      message: 'This is the payment information page',
      instructions: 'Use POST /api/seller_payments to submit payment information'
    });
  });
};
  