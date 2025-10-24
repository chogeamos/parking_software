const cron = require('node-cron');
const parkingModel = require('../models/parkingModel');
const smsService = require('./smsService');

cron.schedule('* * * * *', async () => {
  const now = Date.now();
  const all = parkingModel.listAll();
  for (const park of all) {
    const timeLeft = park.expires_at - now;
    if (timeLeft > 0 && timeLeft < 5 * 60 * 1000 && park.status === 'active') {
      await smsService.sendSms({
        to: park.phone,
        message: `Reminder: Parking for ${park.plate} expires at ${new Date(park.expires_at).toLocaleTimeString()}. Reply 1 to extend by 1 hour (Ksh 50).`
      });
    }
  }
});
