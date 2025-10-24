// ussd.js - USSD flow endpoints (simulate via POST from USSD gateway)
const express = require('express');
const router = express.Router();
const parkingModel = require('../models/parkingModel');
const mpesaService = require('../services/mpesaService');
const smsService = require('../services/smsService');

// helper: hours to ms
const hr = s => s * 60 * 60 * 1000;

router.post('/', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const parts = text ? text.split('*') : [];
  let response = '';

  // Officer USSD: *123*1#
  if (serviceCode === '*123*1#') {
    if (!text || text === '') {
      return res.send('CON Enter plate number to check:');
    }
    const plate = parts[0]?.toUpperCase();
    if (!plate) return res.send('END Invalid input.');
    const record = parkingModel.getLatestByPlate(plate);
    if (!record) return res.send(`END No parking found for ${plate}.`);
    const expiry = new Date(record.expires_at).toLocaleTimeString();
    return res.send(`END ${plate}: ${record.status.toUpperCase()} (expires ${expiry})`);
  }

  // Driver Menu
  if (!text || text === '') {
    response =
      `CON Welcome to KISII Smart Parking\n` +
      `1. Park 1 Hour - Ksh 50\n` +
      `2. Park 2 Hours - Ksh 60\n` +
      `3. Extend Parking - Ksh 20\n` +
      `4. Check Parking Status`;
    return res.send(response);
  }

  const choice = parts[0];

  // Park 1 or 2 hours
  if (choice === '1' || choice === '2') {
    if (parts.length === 1) {
      return res.send('CON Enter Vehicle Plate Number:');
    }

    const plate = parts[1].toUpperCase();
    const durationHours = choice === '1' ? 1 : 2;
    const amount = choice === '1' ? 50 : 60;

    if (parts.length === 2) {
      return res.send(
        `CON Parking for ${plate}\nDuration: ${durationHours} Hour(s)\nAmount: Ksh ${amount}\n\n1. Confirm\n2. Cancel`
      );
    }

    if (parts[2] === '1') {
      const started_at = Date.now();
      const expires_at = started_at + hr(durationHours);
      const mpesa = await mpesaService.stkPush({
        phone: phoneNumber,
        amount,
        accountReference: plate,
        transactionDesc: `Parking ${plate} ${durationHours}h`,
        callbackUrl: process.env.STK_CALLBACK_URL || `${process.env.BASE_URL}/mpesa/callback`
      });
      const park = parkingModel.create({
        plate,
        phone: phoneNumber,
        started_at,
        expires_at,
        amount,
        mpesa_checkout_request_id: mpesa.checkoutRequestID || null
      });
      await smsService.sendSms({
        to: phoneNumber,
        message: `Parking confirmed for ${plate}. Duration: ${durationHours} Hour(s). Expiry: ${new Date(expires_at).toLocaleTimeString()}. Reply 1 to extend before expiry.`
      });
      return res.send(`END Parking confirmed for ${plate}. Duration ${durationHours} hour(s).`);
    }

    return res.send('END Cancelled.');
  }

  // Extend parking
  if (choice === '3') {
    if (parts.length === 1) return res.send('CON Enter Vehicle Plate Number to extend:');
    const plate = parts[1].toUpperCase();
    const record = parkingModel.getLatestByPlate(plate);
    if (!record || record.status !== 'active') return res.send(`END No active parking found for ${plate}.`);
    const extendAmount = 20;

    if (parts.length === 2) {
      return res.send(`CON Extend ${plate} by 1 hour for Ksh ${extendAmount}?\n1. Confirm\n2. Cancel`);
    }

    if (parts[2] === '1') {
      const mpesa = await mpesaService.stkPush({
        phone: phoneNumber,
        amount: extendAmount,
        accountReference: plate,
        transactionDesc: `Extend Parking ${plate} 1h`,
        callbackUrl: process.env.STK_CALLBACK_URL || `${process.env.BASE_URL}/mpesa/callback`
      });
      const newExpires = record.expires_at + hr(1);
      const newAmount = record.amount + extendAmount;
      parkingModel.markExtended(record.id, newExpires, newAmount);
      await smsService.sendSms({
        to: phoneNumber,
        message: `Parking extended. New expiry: ${new Date(newExpires).toLocaleTimeString()}.`
      });
      return res.send(`END Parking extended for ${plate}.`);
    }

    return res.send('END Cancelled.');
  }

  // Check parking status
  if (choice === '4') {
    if (parts.length === 1) return res.send('CON Enter Vehicle Plate Number to check:');
    const plate = parts[1].toUpperCase();
    const record = parkingModel.getLatestByPlate(plate);
    if (!record) return res.send(`END No parking found for ${plate}.`);
    const expiry = new Date(record.expires_at).toLocaleTimeString();
    return res.send(`END Status: ${record.status}\nValid until ${expiry}`);
  }

  return res.send('END Invalid input.');
});

module.exports = router;
