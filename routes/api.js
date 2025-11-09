const express = require('express');
const router = express.Router();

router.get('/gmaps-key', (req, res) => {
  res.json({ apiKey: process.env.GMAPS_API_KEY });
});

module.exports = router;