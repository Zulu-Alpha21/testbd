const response = require('../../utils/response');
const { sendMail } = require('../../services/email');
const generateRandomNumber = require('../../utils/generateRandomNumber');
const dayjs = require('dayjs');

const sendEmailForLoginOtp = ({ userDb }) =>async (user,req,res) => {
  try {
    let otp = generateRandomNumber();
    let expires = dayjs();
    expires = expires.add(6, 'hour').toISOString();
    await userDb.updateOne({
      _id:user.id,
      isActive : true,
      isDeleted : false,
    },  {
      loginOTP: {
        code: otp,
        expireTime: expires 
      } 
    });
    let updatedUser = await userDb.findOne({
      _id:user.id,
      isActive : true,
      isDeleted : false,
    });
    let mailObj = {
      subject: 'Login OTP',
      to: user.email,
      template: '/views/email/OTP',
      data:updatedUser
    };
    await sendMail(mailObj);
    return response.success();
  } catch (error) {
    return response.internalServerError({ message:error.message });
  }
};
module.exports = sendEmailForLoginOtp;