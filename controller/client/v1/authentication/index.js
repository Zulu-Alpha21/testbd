let  userDb = require('../../../../data-access/userDb');
const userTokensDb = require('../../../../data-access/userTokensDb');

const userSchema = require('../../../../validation/schema/user');
const createValidation = require('../../../../validation')(userSchema.createSchema);

const userRoleDb  = require('../../../../data-access/userRoleDb');
const routeRoleDb = require('../../../../data-access/routeRoleDb');

const authController = require('./authController');

const registerUsecase = require('../../../../use-case/authentication/register')({ 
  userDb, 
  createValidation, 
});
const logoutUsecase = require('../../../../use-case/authentication/logout')({ userTokensDb });
const sendOtpForLoginUsecase = require('../../../../use-case/authentication/sendOtpForLogin')({ userDb });
const loginWithOTPUsecase = require('../../../../use-case/authentication/loginWithOTP')({
  userDb,
  userTokensDb
});

const register = authController.register(registerUsecase);
const logout = authController.logout(logoutUsecase);
const sendOtpForLogin = authController.sendOtpForLogin(sendOtpForLoginUsecase);
const loginWithOTP = authController.loginWithOTP(loginWithOTPUsecase);

module.exports = {
  register,
  logout,
  sendOtpForLogin,
  loginWithOTP,
};