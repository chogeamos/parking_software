const express = require('express');
const router = express.Router();
router.post('/callback', (req, res) => {
  console.log('[MPESA CALLBACK]', req.body);
  res.json({ accepted: true });
});
module.exports = router;
