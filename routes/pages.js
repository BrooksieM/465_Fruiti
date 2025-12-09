const express = require('express');
const router = express.Router();
const path = require('path');

const routes = {
  '/': 'homepage.html',
  '/signup': 'signup.html',
  '/login': 'login.html',
  '/settings': 'settingspage.html',
  '/nutrition': 'nutrition.html',
  '/aboutus': 'aboutus.html',
  '/recipe': 'recipe.html',
  '/become-seller': 'become-seller.html',
  '/extend-subscription': 'extend-subscription.html',
  '/seller-dashboard': 'seller-dashboard.html',
  '/fruitstand-favorite': 'fruitstand-favorite.html',
  '/recipe-favorite': 'recipe-favorite.html',
};

Object.entries(routes).forEach(([route, file]) => {
  router.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/UI', file));
  });
});

module.exports = router;