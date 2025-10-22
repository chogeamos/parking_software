const express = require('express');
const router = express.Router();
const parkingModel = require('../models/parkingModel');
router.get('/lookup/:plate', (req, res) => {
  const plate = req.params.plate.toUpperCase();
  const record = parkingModel.getLatestByPlate(plate);
  if (!record) return res.status(404).json({ error: 'Not found' });
  return res.json(record);
});
router.get('/recent', (req, res) => {
  res.json(parkingModel.listAll());
});
module.exports = router;
