const axios = require('axios');
async function stkPush({ phone, amount, accountReference, transactionDesc, callbackUrl }) {
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
    return { success: true, checkoutRequestID: 'SIM-' + Date.now(), message: 'SIMULATED_STK_PUSH' };
  }
  return { success: false, error: 'Real MPESA integration not implemented.' };
}
module.exports = { stkPush };
