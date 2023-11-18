const {
  MAX_LOGIN_RETRY_LIMIT,DEFAULT_SEND_LOGIN_OTP,LOGIN_REACTIVE_TIME, SEND_LOGIN_OTP
} = require('../../constants/authConstant');
const response = require('../../utils/response');
const responseStatus = require('../../utils/response/responseStatus');
const makeSendEmailForLoginOtp = require('./sendEmailForLoginOtp');

const dayjs = require('dayjs');
const sendLoginOTP = ({ userDb }) => async (username, password = null) => {
  let where = { $or:[{ username:username },{ email:username }] };
  where.isActive = true;where.isDeleted = false;        let user = await userDb.findOne(where);
  if (!user) {
    return response.badRequest({ message : 'User not found' });
  }
  if (user.loginRetryLimit >= MAX_LOGIN_RETRY_LIMIT){
    if (user.loginReactiveTime){
      let now = dayjs();
      let limitTime = dayjs(user.loginReactiveTime);
      if (limitTime > now){
        let expireTime = dayjs().add(LOGIN_REACTIVE_TIME,'minute').toISOString();
        await userDb.updateOne({ _id : user.id },{
          loginReactiveTime:expireTime,
          loginRetryLimit:user.loginRetryLimit + 1  
        });
        return response.badRequest({ message : `you have exceed the number of limit.you can login after ${LOGIN_REACTIVE_TIME} minutes.` });
      } 
    } else {
      // send error
      let expireTime = dayjs().add(LOGIN_REACTIVE_TIME,'minute').toISOString();
      await userDb.updateOne({ _id : user.id },{
        loginReactiveTime:expireTime,
        loginRetryLimit:user.loginRetryLimit + 1 
      });
      return response.badRequest({ message : `you have exceed the number of limit.you can login after ${LOGIN_REACTIVE_TIME} minutes.` });                    
    } 
  }
  if (password){
    const isPasswordMatched = await user.isPasswordMatch(password);
    if (!isPasswordMatched) {
      await userDb.updateOne({ _id :user.id }, { loginRetryLimit: user.loginRetryLimit + 1 });
      return response.badRequest({ message : 'Incorrect Password' });
    }
  }
  let result;
  if (DEFAULT_SEND_LOGIN_OTP === SEND_LOGIN_OTP.EMAIL) {
    if (user.email){
      const sendEmailForLoginOtp = makeSendEmailForLoginOtp({ userDb });//inject dependency
      result =  await sendEmailForLoginOtp(user);
    }
  } else if (DEFAULT_SEND_LOGIN_OTP === SEND_LOGIN_OTP.SMS) {
  }
  if (!result || result.status !== responseStatus.success){
    return response.badRequest({ message : 'OTP can not be sent due to some issue try again later.' });
  }
  return response.success({ message : 'Please check your email for OTP' });
};
module.exports = sendLoginOTP;