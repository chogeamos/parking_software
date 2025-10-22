// trimmed version of ussd route for brevity
const express = require('express');
const router = express.Router();
const parkingModel = require('../models/parkingModel');
const mpesaService = require('../services/mpesaService');
const smsService = require('../services/smsService');
const hr = s => s * 60 * 60 * 1000;
router.post('/', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const parts = text ? text.split('*') : [];
  if (!text || text === '') return res.send(`CON Welcome to KISII Smart Parking\n1. Park 1 Hour - Ksh 40\n2. Park 2 Hours - Ksh 60\n3. Extend Parking - Ksh 20\n4. Check Parking Status`);
  const choice = parts[0];
  if (choice === '1' || choice === '2') {
    if (parts.length === 1) return res.send('CON Enter Vehicle Plate Number:');
    const plate = parts[1].toUpperCase();
    const durationHours = choice === '1' ? 1 : 2;
    const amount = choice === '1' ? 40 : 60;
    const started_at = Date.now();
    const expires_at = started_at + hr(durationHours);
    await mpesaService.stkPush({ phone: phoneNumber, amount, accountReference: plate, transactionDesc: `Parking ${plate}`, callbackUrl: process.env.STK_CALLBACK_URL });
    const park = parkingModel.create({ plate, phone: phoneNumber, started_at, expires_at, amount });
    await smsService.sendSms({ to: phoneNumber, message: `Parking confirmed for ${plate}. Expiry: ${new Date(expires_at).toLocaleString()}` });
    return res.send('END Parking confirmed (simulated).');
  }
  return res.send('END Invalid input.');
});
module.exports = router;
