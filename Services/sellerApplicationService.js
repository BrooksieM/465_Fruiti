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

  // GET /api/approved-sellers -> fetch all approved sellers with location data for map display
  app.get('/api/approved-sellers', async (req, res) =>
  {
    try
    {
      const { data, error } = await supabase
        .from('seller_applications')
        .select('id, business_name, description, phone_number, address, city, state, zipcode, user_id')
        .eq('status', 'approved')
        .not('address', 'is', null)
        .not('city', 'is', null)
        .not('state', 'is', null)
        .not('zipcode', 'is', null);

      if (error)
      {
        console.error('Sellers query error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Fetch handles for all sellers
      const userIds = data.map(seller => seller.user_id);
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, handle')
        .in('id', userIds);

      if (accountsError)
      {
        console.error('Accounts query error:', accountsError);
        return res.status(500).json({ error: accountsError.message });
      }

      // Create a map of user_id -> handle for quick lookup
      const handleMap = {};
      accounts.forEach(account => {
        handleMap[account.id] = account.handle;
      });

      // Add handle to each seller
      const enrichedSellers = data.map(seller => ({
        ...seller,
        handle: handleMap[seller.user_id] || null
      }));

      res.json({
        count: enrichedSellers.length,
        sellers: enrichedSellers
      });
    }
    catch (error)
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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

  // ========== SELLER SUBSCRIPTION PURCHASE ==========

  // POST /api/purchase-seller-subscription -> complete seller subscription purchase
  app.post('/api/purchase-seller-subscription', async (req, res) =>
  {
    try
    {
      const {
        // User account info (for new users)
        email,
        password,
        handle,
        // Subscription info
        subscriptionType,
        // Payment info (placeholder until Stripe integration)
        paymentMethod,
        // Stand info
        standName,
        standDescription,
        phone_number,
        standAddress,
        city,
        state,
        zipcode
      } = req.body;

      // Validate required fields
      if (!email || !subscriptionType || !standName || !phone_number || !standAddress || !city || !state || !zipcode)
      {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      const bcrypt = require('bcrypt');
      let userId;
      let isNewUser = false;

      // Check if user exists by email
      const { data: existingAccounts, error: checkError } = await supabase
        .from('accounts')
        .select('id, handle, email')
        .eq('email', email)
        .limit(1);

      if (checkError)
      {
        console.error('Account check error:', checkError);
        return res.status(500).json({ error: 'Error checking existing account' });
      }

      if (existingAccounts && existingAccounts.length > 0)
      {
        // User exists - use their account
        userId = existingAccounts[0].id;
      }
      else
      {
        // New user - create account
        if (!password || !handle)
        {
          return res.status(400).json({
            error: 'Password and handle are required for new accounts'
          });
        }

        if (password.length < 6)
        {
          return res.status(400).json({
            error: 'Password must be at least 6 characters long'
          });
        }

        // Check if handle already exists
        const { data: handleCheck } = await supabase
          .from('accounts')
          .select('handle')
          .eq('handle', handle)
          .limit(1);

        if (handleCheck && handleCheck.length > 0)
        {
          return res.status(409).json({ error: 'Handle already exists' });
        }

        // Hash password and create account
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const { data: newAccount, error: createError } = await supabase
          .from('accounts')
          .insert([
            {
              handle,
              email,
              password: hashedPassword,
              avatar: null,
              payment_method: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select('id');

        if (createError)
        {
          console.error('Account creation error:', createError);
          return res.status(500).json({ error: 'Failed to create account' });
        }

        userId = newAccount[0].id;
        isNewUser = true;
      }

      // Map subscription type to ID from seller_subscriptions table
      const subscriptionMap = {
        'monthly': 1,
        '3month': 2,
        '6month': 3
      };

      const subscriptionId = subscriptionMap[subscriptionType];
      if (!subscriptionId)
      {
        return res.status(400).json({ error: 'Invalid subscription type' });
      }

      // Get subscription details
      const { data: subscription } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      // Update account payment method (once Stripe is integrated, this will be the actual card info)
      await supabase
        .from('accounts')
        .update({
          payment_method: { type: paymentMethod || 'card', status: 'active' },
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Calculate subscription end date
      const now = new Date();
      const durationMap = {
        '1 month': 1,
        '3 months': 3,
        '6 months': 6
      };
      const months = durationMap[subscription.duration] || 1;
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + months);

      // Create seller application with subscription
      const { data: application, error: appError } = await supabase
        .from('seller_applications')
        .insert([
          {
            user_id: userId,
            business_name: standName,
            description: standDescription || '',
            subscription_plan_id: subscriptionId,
            status: 'approved', // Auto-approve upon payment
            phone_number: phone_number,
            address: standAddress,
            city: city,
            state: state,
            zipcode: zipcode,
            created_at: now.toISOString()
          }
        ])
        .select();
      
      //Change account seller status to TRUE
      
      if (appError)
      {
        console.error('Application creation error:', appError);
        return res.status(500).json({ error: 'Failed to create seller application' });
      }

      res.status(201).json({
        success: true,
        message: 'Seller subscription purchased successfully!',
        userId: userId,
        applicationId: application[0].id,
        isNewUser: isNewUser,
        subscriptionEnd: endDate.toISOString()
      });
    }
    catch (error)
    {
      console.error('Purchase error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};