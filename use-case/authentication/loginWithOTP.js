
const dayjs = require('dayjs'); 
const response = require('../../utils/response');
const responseStatus = require('../../utils/response/responseStatus');
const makeLoginUser = require('../common/loginUser'); 

/**
 * @description : send OTP to user for login
 * @param {Object} params : request for sendOtpForLogin
 * @param {Number} platform : platform details.
 * @return {Object} : response for sendOtpForLogin {status, message, data}
 */
const loginWithOTP = ({
  userDb,userTokensDb 
}) => async (params,platform) => {
  if (!params.code || !params.username) {
    return response.badRequest({ message : 'Insufficient request parameters! username and code is required.' });
  }
  let username = params.username;
  let where = { $or:[{ username:params.username },{ email:params.username }] };
  where.isActive = true;where.isDeleted = false;    let user = await userDb.findOne(where);
  if (!user) {
    return response.badRequest({ message: 'User not exists' });
  }

  if (user.loginOTP && user.loginOTP.expireTime) {
    if (dayjs(new Date()).isAfter(dayjs(user.loginOTP.expireTime))) {// link expire
      return response.badRequest({ message :'Your reset password link is expired or invalid' });
    }
    if (user.loginOTP.code !== params.code) {
      return response.badRequest({ message :'Invalid Code' });
    }
  } else {
    return response.badRequest({ message: 'Invalid Code' });
  }

  let roleAccess = false;
  if (params.includeRoleAccess){
    roleAccess = params.includeRoleAccess;
  }
  const loginUser = makeLoginUser({
    userDb,
    userTokensDb
  });
  let result = await loginUser(username, platform, null ,roleAccess);
  if (result && result.status === responseStatus.success) {
    await userDb.updateOne({ _id: result.data.id }, { loginOTP: null });
  }
  return result;
};
module.exports = loginWithOTP;