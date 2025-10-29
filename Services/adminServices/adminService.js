// Services/adminService.js

module.exports = function (app, supabase) 
{
  // Helper function to log admin actions
  async function logAdminAction(adminId, action, targetType, targetId = null, details = {}) 
  {
    try 
    {
      await supabase
        .from('admin_logs')
        .insert([
          {
            admin_id: adminId,
            action,
            target_type: targetType,
            target_id: targetId,
            details,
            created_at: new Date().toISOString()
          }
        ]);
    } 
    catch (error) 
    {
      console.error('Failed to log admin action:', error);
    }
  }

  // GET /api/admin/accounts -> view all accounts (with pagination and filters)
  app.get('/api/admin/accounts', async (req, res) => 
  {
    try 
    {
      const { page = 1, limit = 20, search = '', status = 'active' } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('accounts')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (search) 
      {
        query = query.or(`handle.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Apply status filter
      if (status === 'active') 
      {
        query = query.is('deleted_at', null);
      } 
      else if (status === 'deleted') 
      {
        query = query.not('deleted_at', 'is', null);
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) 
      {
        console.error('Admin accounts query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        accounts: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/admin/accounts/:id -> delete user account (soft delete)
  app.delete('/api/admin/accounts/:id', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);
      const adminId = req.headers['x-admin-id'] || 1; // In real app, get from auth

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      // Check if account exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Soft delete by setting deleted_at timestamp
      const { error } = await supabase
        .from('accounts')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) 
      {
        console.error('Admin delete error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Log the admin action
      await logAdminAction(
        adminId,
        'DELETE_ACCOUNT',
        'account',
        id,
        { 
          deleted_handle: existingAccount.handle,
          deleted_email: existingAccount.email 
        }
      );

      res.json({ 
        message: 'Account deleted successfully',
        deletedId: id
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/admin/accounts/:id/restore -> restore soft-deleted account
  app.post('/api/admin/accounts/:id/restore', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);
      const adminId = req.headers['x-admin-id'] || 1;

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      // Check if account exists and is deleted
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .not('deleted_at', 'is', null)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Deleted account not found' });
      }

      // Restore by clearing deleted_at
      const { error } = await supabase
        .from('accounts')
        .update({
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) 
      {
        console.error('Admin restore error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Log the admin action
      await logAdminAction(
        adminId,
        'RESTORE_ACCOUNT',
        'account',
        id,
        { 
          restored_handle: existingAccount.handle,
          restored_email: existingAccount.email 
        }
      );

      res.json({ 
        message: 'Account restored successfully',
        restoredId: id
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/admin/stats -> get admin dashboard statistics
  app.get('/api/admin/stats', async (req, res) => 
  {
    try 
    {
      // Get total accounts count
      const { count: totalAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Get total recipes count
      const { count: totalRecipes, error: recipesError } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

      // Get total fruit stands count
      const { count: totalFruitStands, error: standsError } = await supabase
        .from('fruitstands')
        .select('*', { count: 'exact', head: true });

      // Get total comments count
      const { count: totalComments, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Get recent admin actions
      const { data: recentActions, error: actionsError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (accountsError || recipesError || standsError || commentsError || actionsError) 
      {
        console.error('Admin stats error:', { accountsError, recipesError, standsError, commentsError, actionsError });
        return res.status(500).json({ error: 'Error fetching admin statistics' });
      }

      res.json({
        stats: {
          totalAccounts,
          totalRecipes,
          totalFruitStands,
          totalComments
        },
        recentActions: recentActions || []
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/admin/logs -> get admin action logs
  app.get('/api/admin/logs', async (req, res) => 
  {
    try 
    {
      const { page = 1, limit = 50, action = '' } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('admin_logs')
        .select('*', { count: 'exact' });

      // Filter by action type if provided
      if (action) 
      {
        query = query.eq('action', action);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) 
      {
        console.error('Admin logs query error:', error);
        return res.status(500).json({ error: error.message });
      }

      res.json({
        logs: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/admin/accounts/:id/ban -> ban user account
  app.post('/api/admin/accounts/:id/ban', async (req, res) => 
  {
    try 
    {
      const id = Number(req.params.id);
      const adminId = req.headers['x-admin-id'] || 1;
      const { reason } = req.body;

      if (!Number.isInteger(id) || id <= 0) 
      {
        return res.status(400).json({ error: 'Invalid account ID' });
      }

      // Check if account exists
      const { data: existingAccount, error: checkError } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (checkError) 
      {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Add banned status (you might want to add a 'banned' column or use existing deleted_at)
      const { error } = await supabase
        .from('accounts')
        .update({
          banned_at: new Date().toISOString(),
          ban_reason: reason || 'No reason provided',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) 
      {
        console.error('Admin ban error:', error);
        return res.status(500).json({ error: error.message });
      }

      // Log the admin action
      await logAdminAction(
        adminId,
        'BAN_ACCOUNT',
        'account',
        id,
        { 
          banned_handle: existingAccount.handle,
          reason: reason || 'No reason provided'
        }
      );

      res.json({ 
        message: 'Account banned successfully',
        bannedId: id,
        reason: reason || 'No reason provided'
      });
    } 
    catch (error) 
    {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};