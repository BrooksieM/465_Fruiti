// Services/accountService.js

module.exports = function (app, supabase) 

{
  // Dev ping
  app.get('/api/accounts/__ping', (_req, res) => res.json({ ok: true }));

  // POST /api/accounts -> create new account
  app.post('/api/accounts', async (req, res) => {
    try {
      const { handle, email, avatar } = req.body || {};

      // Validate required fields
      if (!handle || !email) {
        return res.status(400).json({ error: 'Handle and email are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if handle or email already exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('handle, email')
        .or(`handle.eq.${handle},email.eq.${email}`)
        .limit(1);

      if (checkError) {
        console.error('Check existing account error:', checkError);
        return res.status(500).json({ error: 'Error checking existing account' });
      }

      if (existingAccount && existingAccount.length > 0) {
        const conflict = existingAccount[0];
        if (conflict.handle === handle) {
          return res.status(409).json({ error: 'Handle already exists' });
        }
        if (conflict.email === email) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }

      // Insert new account
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          {
            handle,
            email,
            avatar: avatar || null,
            payment_method: null,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Account insert error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/accounts -> get all accounts
  app.get('/api/accounts', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Accounts query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/accounts/:id -> get account by ID
  app.get('/api/accounts/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Account not found' });
        }
        console.error('Account query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/accounts/:id -> update account
  app.put('/api/accounts/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { handle, email, avatar } = req.body || {};

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      // Check if account exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // If handle or email is being updated, check for conflicts
      if (handle || email) {
        const { data: conflictAccount, error: conflictError } = await supabase
          .from('accounts')
          .select('handle, email')
          .or(`handle.eq.${handle},email.eq.${email}`)
          .neq('id', id)
          .limit(1);

        if (conflictError) {
          console.error('Conflict check error:', conflictError);
          return res.status(500).json({ error: 'Error checking account conflicts' });
        }

        if (conflictAccount && conflictAccount.length > 0) {
          const conflict = conflictAccount[0];
          if (handle && conflict.handle === handle) {
            return res.status(409).json({ error: 'Handle already exists' });
          }
          if (email && conflict.email === email) {
            return res.status(409).json({ error: 'Email already exists' });
          }
        }
      }

      // Update account
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (handle !== undefined) updateData.handle = handle;
      if (email !== undefined) updateData.email = email;
      if (avatar !== undefined) updateData.avatar = avatar;

      const { data, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Account update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0]);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/accounts/:id/profile-picture -> update profile picture
  app.put('/api/accounts/:id/profile-picture', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { url } = req.body || {};

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // Check if account exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Update profile picture
      const { data, error } = await supabase
        .from('accounts')
        .update({
          avatar: url,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, avatar');

      if (error) {
        console.error('Profile picture update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ avatar: data[0].avatar });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/accounts/:id/payment-method -> update payment method
  app.put('/api/accounts/:id/payment-method', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { brand, last4 } = req.body || {};

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      if (!brand || !last4) {
        return res.status(400).json({ error: 'Brand and last4 are required' });
      }

      // Check if account exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Update payment method
      const { data, error } = await supabase
        .from('accounts')
        .update({
          payment_method: { brand, last4 },
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, payment_method');

      if (error) {
        console.error('Payment method update error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json(data[0].payment_method);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/accounts/:id -> delete account
  app.delete('/api/accounts/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      // Check if account exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Delete account
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Account delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ deleted: { id } });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/accounts/search?q=searchterm -> search accounts
  app.get('/api/accounts/search', async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .or(`handle.ilike.%${q}%,email.ilike.%${q}%`)
        .order('handle')
        .limit(10);

      if (error) {
        console.error('Account search error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        query: q,
        count: data.length,
        accounts: data
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
