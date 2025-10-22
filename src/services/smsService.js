const axios = require('axios');
async function sendSms({ to, message }) {
  if (!process.env.SMS_API_KEY) {
    console.log(`[SMS STUB] To: ${to} - Message: ${message}`);
    return { success: true, provider: 'stub' };
  }
  return { success: false, error: 'Real SMS provider not implemented.' };
}
module.exports = { sendSms };
