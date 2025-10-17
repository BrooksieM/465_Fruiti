////////admin_shit/////

//view all logged in users
app.get('/api/admin/account', (req, res) => {
  // Implement logic to retrieve all logged in users
  res.json({ message: 'This is where the user list would go.' });
});

//delete a users account
app.delete('/api/admin/account/:id', (req, res) => {
  // Implement logic to delete a user's account
  res.json({ message: 'User account deleted successfully.' });
});

//restore a users account
app.post('/api/admin/account/:id/restore', (req, res) => {
  // Implement logic to restore a user's account
  res.json({ message: 'User account restored successfully.' });
});

////////admin_shit end//////