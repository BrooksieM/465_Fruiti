// src/data/store.js
// In-memory data store shared by all routes.

// -------- Accounts --------
const accounts = global.accounts || [];
global.accounts = accounts;

function nextAcctId() {
  return accounts.length ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
}

// -------- Comments --------
// Map: recipeId -> array of comments
const commentsByRecipe = global.commentsByRecipe || {};
global.commentsByRecipe = commentsByRecipe;

function nextCommentId(recipeId) {
  const list = commentsByRecipe[recipeId] || [];
  return list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
}

module.exports = {
  accounts,
  nextAcctId,
  commentsByRecipe,
  nextCommentId
};
