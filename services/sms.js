/** 
 * smsService.js
 * @description :: exports function used in sending sms using twilio provider
 */
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const sendSMS = async (obj) => {
  const client = require('twilio')(accountSid, authToken);
  let recipients = [];
  if (Array.isArray(obj.to)) {
    recipients = recipients.concat(obj.to);
  } else if (typeof obj.to === 'string') {
    const mobileArray = obj.to.split(',');
    recipients = recipients.concat(mobileArray);
  }
  const smsSent = await Promise.all(recipients.map(async (mobileNo) => {
    const samplePromise = new Promise((resolve, reject) => {
      client.messages
        .create({
          body: obj.message,
          messagingServiceSid: process.env.TWILIO_MSG_SERVICE_SID,
          to: mobileNo
        })
        .then(message => { console.log(`Message sent successfully: ${message.sid}`); resolve(true); })
        .catch(error => reject(error));
    });
    return samplePromise;
  }));
  return smsSent;

};

module.exports = { sendSMS };