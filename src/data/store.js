// src/data/store.js
// Minimal in-memory store for Accounts (replace with DB later if needed).

const accounts = [
    { id: 1, handle: 'buyer1', email: 'b1@example.com', avatar: null, paymentMethod: null }
  ];
  
  function nextAcctId() {
    return accounts.length ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
  }
  
  module.exports = { accounts, nextAcctId };
  