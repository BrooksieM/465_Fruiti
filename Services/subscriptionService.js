// Services/subscriptionService.js
// Handles user subscription management

module.exports = function (app, supabase) {

  // ========== GET USER'S ACTIVE SUBSCRIPTION ==========

  /**
   * GET /api/users/:userId/subscription
   * Get current active subscription for a user
   */
  app.get('/api/users/:userId/subscription', async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Get active subscription with plan details
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:seller_subscriptions(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({
            error: 'No active subscription found',
            hasSubscription: false
          });
        }
        console.error('Subscription query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        hasSubscription: true,
        subscription: data
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== GET ALL USER SUBSCRIPTIONS (HISTORY) ==========

  /**
   * GET /api/users/:userId/subscriptions
   * Get all subscriptions for a user (including history)
   */
  app.get('/api/users/:userId/subscriptions', async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:seller_subscriptions(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Subscriptions query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        count: data.length,
        subscriptions: data
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== CHECK SUBSCRIPTION STATUS ==========

  /**
   * GET /api/users/:userId/subscription/status
   * Quick check if user has active subscription
   */
  app.get('/api/users/:userId/subscription/status', async (req, res) => {
    try {
      const userId = Number(req.params.userId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id, status, end_date')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Status check error:', error);
        return res.status(500).json({ error: error.message });
      }

      const isActive = !!data;
      const daysRemaining = isActive
        ? Math.ceil((new Date(data.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

      res.json({
        isActive,
        isSeller: isActive,
        daysRemaining,
        endDate: isActive ? data.end_date : null
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== CREATE SUBSCRIPTION ==========

  /**
   * POST /api/subscriptions
   * Create a new subscription for a user
   */
  app.post('/api/subscriptions', async (req, res) => {
    try {
      const {
        userId,
        subscriptionPlanId,
        paymentMethodId,
        autoRenew = true
      } = req.body;

      if (!userId || !subscriptionPlanId) {
        return res.status(400).json({
          error: 'User ID and subscription plan ID are required'
        });
      }

      // Get subscription plan details
      const { data: plan, error: planError } = await supabase
        .from('seller_subscriptions')
        .select('*')
        .eq('id', subscriptionPlanId)
        .single();

      if (planError) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate);

      // Parse duration (e.g., "1 month", "3 months", "6 months")
      const durationMatch = plan.duration.match(/(\d+)\s*(month|day|year)/i);
      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();

        if (unit === 'month') {
          endDate.setMonth(endDate.getMonth() + amount);
        } else if (unit === 'day') {
          endDate.setDate(endDate.getDate() + amount);
        } else if (unit === 'year') {
          endDate.setFullYear(endDate.getFullYear() + amount);
        }
      }

      const nextBillingDate = autoRenew ? new Date(endDate) : null;

      // Create subscription
      const { data: subscription, error: insertError } = await supabase
        .from('user_subscriptions')
        .insert([
          {
            user_id: userId,
            subscription_plan_id: subscriptionPlanId,
            status: 'active',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            auto_renew: autoRenew,
            payment_method_id: paymentMethodId || null,
            last_payment_date: startDate.toISOString(),
            next_billing_date: nextBillingDate?.toISOString(),
            created_at: startDate.toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Subscription insert error:', insertError);
        return res.status(500).json({ error: insertError.message });
      }

      // Update user's is_seller status
      await supabase
        .from('accounts')
        .update({ is_seller: true, updated_at: new Date().toISOString() })
        .eq('id', userId);

      res.status(201).json({
        success: true,
        message: 'Subscription created successfully',
        subscription
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== CANCEL SUBSCRIPTION ==========

  /**
   * PUT /api/subscriptions/:id/cancel
   * Cancel a subscription (stops auto-renewal)
   */
  app.put('/api/subscriptions/:id/cancel', async (req, res) => {
    try {
      const subscriptionId = Number(req.params.id);

      if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }

      // Check if subscription exists
      const { data: existing, error: checkError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (checkError) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (existing.status === 'cancelled') {
        return res.status(400).json({ error: 'Subscription already cancelled' });
      }

      // Update subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          auto_renew: false,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select();

      if (error) {
        console.error('Cancel error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        success: true,
        message: 'Subscription cancelled successfully. Access will continue until end date.',
        subscription: data[0]
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== RENEW SUBSCRIPTION ==========

  /**
   * POST /api/subscriptions/:id/renew
   * Renew an expired or cancelled subscription
   */
  app.post('/api/subscriptions/:id/renew', async (req, res) => {
    try {
      const subscriptionId = Number(req.params.id);

      if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }

      // Get existing subscription
      const { data: existing, error: checkError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plan:seller_subscriptions(*)
        `)
        .eq('id', subscriptionId)
        .single();

      if (checkError) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      // Calculate new dates
      const startDate = new Date();
      const endDate = new Date(startDate);

      const durationMatch = existing.subscription_plan.duration.match(/(\d+)\s*(month|day|year)/i);
      if (durationMatch) {
        const amount = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();

        if (unit === 'month') {
          endDate.setMonth(endDate.getMonth() + amount);
        }
      }

      // Update subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          last_payment_date: startDate.toISOString(),
          next_billing_date: existing.auto_renew ? endDate.toISOString() : null,
          cancelled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select();

      if (error) {
        console.error('Renew error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Ensure user is marked as seller
      await supabase
        .from('accounts')
        .update({ is_seller: true })
        .eq('id', existing.user_id);

      res.json({
        success: true,
        message: 'Subscription renewed successfully',
        subscription: data[0]
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ========== UPDATE AUTO-RENEWAL SETTING ==========

  /**
   * PUT /api/subscriptions/:id/auto-renew
   * Toggle auto-renewal on/off
   */
  app.put('/api/subscriptions/:id/auto-renew', async (req, res) => {
    try {
      const subscriptionId = Number(req.params.id);
      const { autoRenew } = req.body;

      if (!Number.isInteger(subscriptionId) || subscriptionId <= 0) {
        return res.status(400).json({ error: 'Invalid subscription ID' });
      }

      if (typeof autoRenew !== 'boolean') {
        return res.status(400).json({ error: 'autoRenew must be a boolean' });
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          auto_renew: autoRenew,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select();

      if (error) {
        console.error('Auto-renew update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        success: true,
        message: `Auto-renewal ${autoRenew ? 'enabled' : 'disabled'}`,
        subscription: data[0]
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
