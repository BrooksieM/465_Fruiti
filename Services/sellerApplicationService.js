// Services/sellerApplicationService.js

// Geocoding utility function - converts address to latitude/longitude
async function geocodeAddress(address, city, state, zipcode) {
  try {
    // Construct full address
    const fullAddress = `${address}, ${city}, ${state} ${zipcode}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    // Try Google Maps Geocoding API first (requires env variable GOOGLE_MAPS_API_KEY)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const location = data.results[0].geometry.location;
              console.log(`Google Maps geocoded: ${fullAddress}`);
              return {
                latitude: location.lat,
                longitude: location.lng
              };
            } else {
              console.warn(`Google Maps API returned status: ${data.status}`);
            }
          } else {
            console.warn('Google Maps returned non-JSON response, skipping...');
          }
        }
      } catch (googleError) {
        console.warn('Google Maps geocoding failed, trying Nominatim:', googleError.message);
      }
    }

    // Fallback to OpenStreetMap Nominatim API (free, no key needed)
    // Add delay to respect Nominatim usage policy
    console.log('Waiting 1 second before Nominatim request...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Calling Nominatim API for:', fullAddress);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=us&limit=1`;
    const nominatimResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Fruiti-App/1.0 (fruit stand locator)',
        'Accept': 'application/json'
      }
    });

    console.log('Nominatim response status:', nominatimResponse.status);
    console.log('Nominatim response headers:', Object.fromEntries(nominatimResponse.headers));

    if (!nominatimResponse.ok) {
      throw new Error(`Nominatim HTTP error: ${nominatimResponse.status}`);
    }

    const contentType = nominatimResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await nominatimResponse.text();
      console.error('Nominatim non-JSON response:', responseText.substring(0, 200));
      throw new Error(`Nominatim returned non-JSON response: ${contentType}`);
    }

    console.log('Parsing Nominatim JSON response...');
    const nominatimData = await nominatimResponse.json();
    console.log('Nominatim data:', nominatimData);

    if (nominatimData && nominatimData.length > 0) {
      console.log(`Nominatim geocoded: ${fullAddress}`);
      return {
        latitude: parseFloat(nominatimData[0].lat),
        longitude: parseFloat(nominatimData[0].lon)
      };
    }

    // If both geocoding methods fail, return null
    console.warn(`Could not geocode address: ${fullAddress}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

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
        .select('*')
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

      // Filter out sellers with expired subscriptions
      const today = new Date();
      const activeSellers = data.filter(seller => {
        // If no subscription end date, consider it as expired/inactive
        if (!seller.subscription_end_date) {
          return false;
        }
        
        const endDate = new Date(seller.subscription_end_date);
        return endDate > today;
      });

      // Fetch handles for all active sellers
      const userIds = activeSellers.map(seller => seller.user_id);
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
      const enrichedSellers = activeSellers.map(seller => ({
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
        isExtension,
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
      
      let endDate;
      let application;
      let appError;

      // Check if this is a subscription extension
      if (isExtension) {
        // Get existing fruit stand
        const { data: existingStand, error: standError } = await supabase
          .from('seller_applications')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (standError || !existingStand) {
          return res.status(404).json({ error: 'No existing fruit stand found for this user' });
        }

        // Calculate new end date from current expiration (or now if already expired)
        const currentEndDate = new Date(existingStand.subscription_end_date || now);
        const extendFrom = currentEndDate > now ? currentEndDate : now;
        endDate = new Date(extendFrom);
        endDate.setMonth(endDate.getMonth() + months);

        // Update existing fruit stand with new subscription info
        const updateResult = await supabase
          .from('seller_applications')
          .update({
            subscription_plan_id: subscriptionId,
            subscription_end_date: endDate.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('user_id', userId)
          .select();

        application = updateResult.data;
        appError = updateResult.error;
      } else {
        // Check if user already has a fruit stand
        const { data: existingStand } = await supabase
          .from('seller_applications')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (existingStand && existingStand.length > 0) {
          return res.status(409).json({ 
            error: 'You already have a fruit stand. Please use the extension page to extend your subscription.',
            shouldRedirect: true
          });
        }

        // Calculate subscription end date for new subscription
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + months);

        // Geocode the address before creating the application
        console.log('Attempting to geocode:', standAddress, city, state, zipcode);
        const coordinates = await geocodeAddress(standAddress, city, state, zipcode);
        console.log('Geocoding result:', coordinates);

        // Create new seller application with subscription
        const insertResult = await supabase
          .from('seller_applications')
          .insert([
            {
              user_id: userId,
              business_name: standName,
              description: standDescription || '',
              subscription_plan_id: subscriptionId,
              subscription_end_date: endDate.toISOString(),
              status: 'approved', // Auto-approve upon payment
              phone_number: phone_number,
              address: standAddress,
              city: city,
              state: state,
              zipcode: zipcode,
              latitude: coordinates?.latitude || null,
              longitude: coordinates?.longitude || null,
              created_at: now.toISOString()
            }
          ])
          .select();

        application = insertResult.data;
        appError = insertResult.error;
      }

      //Change account seller status to TRUE
      if (!appError) {
        await supabase
          .from('accounts')
          .update({ is_seller: true })
          .eq('id', userId);
      }

      if (appError)
      {
        console.error('Application creation error:', appError);
        return res.status(500).json({ error: 'Failed to create seller application' });
      }

      const successMessage = isExtension 
        ? 'Subscription extended successfully!' 
        : 'Seller subscription purchased successfully!';

      res.status(201).json({
        success: true,
        message: successMessage,
        userId: userId,
        applicationId: application[0].id,
        isNewUser: isNewUser,
        isExtension: isExtension,
        subscriptionEnd: endDate.toISOString()
      });
    }
    catch (error)
    {
      console.error('Purchase error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/extend-subscription -> extend existing subscription (no stand info needed)
  app.post('/api/extend-subscription', async (req, res) =>
  {
    try
    {
      const {
        email,
        subscriptionType,
        paymentMethod
      } = req.body;

      // Validate required fields
      if (!email || !subscriptionType)
      {
        return res.status(400).json({
          error: 'Missing required fields'
        });
      }

      // Get user by email
      const { data: existingAccounts, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (checkError)
      {
        console.error('Account check error:', checkError);
        return res.status(500).json({ error: 'Error checking existing account' });
      }

      if (!existingAccounts || existingAccounts.length === 0)
      {
        return res.status(404).json({ error: 'Account not found' });
      }

      const userId = existingAccounts[0].id;

      // Get existing fruit stand
      const { data: existingStand, error: standError } = await supabase
        .from('seller_applications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (standError || !existingStand)
      {
        return res.status(404).json({ error: 'No existing fruit stand found for this user' });
      }

      // Map subscription type to ID
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

      // Update payment method
      await supabase
        .from('accounts')
        .update({
          payment_method: { type: paymentMethod || 'card', status: 'active' },
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Calculate new end date
      const now = new Date();
      const durationMap = {
        '1 month': 1,
        '3 months': 3,
        '6 months': 6
      };
      const months = durationMap[subscription.duration] || 1;

      // Calculate new end date from current expiration (or now if already expired)
      const currentEndDate = new Date(existingStand.subscription_end_date || now);
      const extendFrom = currentEndDate > now ? currentEndDate : now;
      const endDate = new Date(extendFrom);
      endDate.setMonth(endDate.getMonth() + months);

      // Update existing fruit stand with new subscription info
      const { data: application, error: updateError } = await supabase
        .from('seller_applications')
        .update({
          subscription_plan_id: subscriptionId,
          subscription_end_date: endDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (updateError)
      {
        console.error('Subscription update error:', updateError);
        return res.status(500).json({ error: 'Failed to update subscription' });
      }

      res.status(200).json({
        success: true,
        message: 'Subscription extended successfully!',
        userId: userId,
        applicationId: application[0].id,
        subscriptionEnd: endDate.toISOString()
      });
    }
    catch (error)
    {
      console.error('Extension error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/geocode-sellers -> re-geocode sellers without coordinates (admin tool)
  app.post('/api/geocode-sellers', async (req, res) => {
    try {
      // Get all approved sellers without coordinates
      const { data: sellers, error } = await supabase
        .from('seller_applications')
        .select('*')
        .eq('status', 'approved')
        .not('address', 'is', null)
        .or('latitude.is.null,longitude.is.null');

      if (error) {
        console.error('Query error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!sellers || sellers.length === 0) {
        return res.json({ 
          message: 'No sellers found that need geocoding',
          geocoded: 0 
        });
      }

      let successCount = 0;
      let failCount = 0;
      const results = [];

      // Geocode each seller
      for (const seller of sellers) {
        try {
          const coordinates = await geocodeAddress(
            seller.address,
            seller.city,
            seller.state,
            seller.zipcode
          );

          if (coordinates) {
            // Update the seller with new coordinates
            const { error: updateError } = await supabase
              .from('seller_applications')
              .update({
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
              })
              .eq('id', seller.id);

            if (!updateError) {
              successCount++;
              results.push({
                id: seller.id,
                business_name: seller.business_name,
                status: 'success',
                coordinates
              });
            } else {
              failCount++;
              results.push({
                id: seller.id,
                business_name: seller.business_name,
                status: 'update_failed',
                error: updateError.message
              });
            }
          } else {
            failCount++;
            results.push({
              id: seller.id,
              business_name: seller.business_name,
              status: 'geocoding_failed'
            });
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          failCount++;
          results.push({
            id: seller.id,
            business_name: seller.business_name,
            status: 'error',
            error: err.message
          });
        }
      }

      res.json({
        message: `Geocoding complete. Success: ${successCount}, Failed: ${failCount}`,
        total: sellers.length,
        success: successCount,
        failed: failCount,
        results
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};