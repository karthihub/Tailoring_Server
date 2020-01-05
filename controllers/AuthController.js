const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");
const Strings = require("../helpers/Strings");

/**
 * User registration.
 *
 * @param {string}      firstName
 * @param {string}      lastName
 * @param {string}      email
 * @param {string}      password
 * @param {string}		gender
 * @param {string}		age
 * @param {number}		mobilenumber
 * @param {string}		_IDNO
 * @param {string}		_IMEI
 * @param {string}		_FCMT
 * @param {string}		_IMGP
 * @returns {Object}
 */
exports.register = [
	// Validate fields.
	body("firstName").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_1)
		.isAlphanumeric().withMessage(Strings.staticLabel.en.error.error_2),
	body("lastName").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_3)
		.isAlphanumeric().withMessage(Strings.staticLabel.en.error.error_4),
	body("email").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_5)
		.isEmail().withMessage(Strings.staticLabel.en.error.error_6).custom((value) => {
			return UserModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject(Strings.staticLabel.en.error.error_7);
				}
			});
		}),
	body("gender").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_8),
	body("age").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_9),
	body("mobilenumber").isLength({ min: 10 }).trim().withMessage(Strings.staticLabel.en.error.error_10),
	body("_IDNO").isLength({ min: 10 }).trim().withMessage(Strings.staticLabel.en.error.error_11),
	body("_IMEI").isLength({ min: 10 }).trim().withMessage(Strings.staticLabel.en.error.error_11),
	body("_FCMT").isLength({ min: 10 }).trim().withMessage(Strings.staticLabel.en.error.error_11),
	body("_IMGP").isLength({ min: 10 }).trim().withMessage(Strings.staticLabel.en.error.error_11),
	body("password").isLength({ min: 6 }).trim().withMessage(Strings.staticLabel.en.error.error_12),
	// Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	// Process request after validation and sanitization.
	(req, res) => {
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					var user = new UserModel(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							gender: req.body.gender,
							age : req.body.age,
							mobilenumber : req.body.mobilenumber,
							email: req.body.email,
							password: hash,
							confirmOTP: otp,
							_IDNO: req.body._IDNO,
							_IMEI: req.body._IMEI,
							_FCMT: req.body._FCMT,
							_IMGP: req.body._IMGP
						});
					// Html email body
					let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
					// Send confirmation email
					mailer.send(
						constants.confirmEmails.from, 
						req.body.email,
						"Confirm Account",
						html
					).then(function(){
						// Save user.
						user.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							let userData = {
								_id: user._id,
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email
							};
							return apiResponse.successResponseWithData(res,"Registration Success.", userData);
						});
					}).catch(err => {
						console.log(err);
						return apiResponse.ErrorResponse(res,err);
					}) ;
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = [
	body("email").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_5)
		.isEmail().withMessage(Strings.staticLabel.en.error.error_6),
	body("password").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_13),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				UserModel.findOne({email : req.body.email}).then(user => {
					if (user) {
						//Compare given password with db's hash.
						bcrypt.compare(req.body.password,user.password,function (err,same) {
							if(same){
								//Check account confirmation.
								if(user.isConfirmed){
									// Check User's account active or not.
									if(user.status) {
										let userData = {
											_id: user._id,
											firstName: user.firstName,
											lastName: user.lastName,
											email: user.email,
										};
										//Prepare JWT token for authentication
										const jwtPayload = userData;
										const jwtData = {
											expiresIn: process.env.JWT_TIMEOUT_DURATION,
										};
										const secret = process.env.JWT_SECRET;
										//Generated JWT token with Payload and secret.
										userData.token = jwt.sign(jwtPayload, secret, jwtData);
										return apiResponse.successResponseWithData(res,"Login Success.", userData);
									}else {
										return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_14);
									}
								}else{
									return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_15);
								}
							}else{
								return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_16);
							}
						});
					}else{
						return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_16);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Verify Confirm otp.
 *
 * @param {string}      email
 * @param {string}      otp
 *
 * @returns {Object}
 */
exports.verifyConfirm = [
	body("email").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_5)
		.isEmail().withMessage(Strings.staticLabel.en.error.error_6),
	body("otp").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_17),
	sanitizeBody("email").escape(),
	sanitizeBody("otp").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							//Check account confirmation.
							if(user.confirmOTP == req.body.otp){
								//Update user as confirmed
								UserModel.findOneAndUpdate(query, {
									isConfirmed: 1,
									confirmOTP: null 
								}).catch(err => {
									return apiResponse.ErrorResponse(res, err);
								});
								return apiResponse.successResponse(res, Strings.staticLabel.en.error.error_18);
							}else{
								return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_19);
							}
						}else{
							return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_20);
						}
					}else{
						return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_21);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];

/**
 * Resend Confirm otp.
 *
 * @param {string}      email
 *
 * @returns {Object}
 */
exports.resendConfirmOtp = [
	body("email").isLength({ min: 1 }).trim().withMessage(Strings.staticLabel.en.error.error_5)
		.isEmail().withMessage(Strings.staticLabel.en.error.error_6),
	sanitizeBody("email").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				var query = {email : req.body.email};
				UserModel.findOne(query).then(user => {
					if (user) {
						//Check already confirm or not.
						if(!user.isConfirmed){
							// Generate otp
							let otp = utility.randomNumber(4);
							// Html email body
							let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
							// Send confirmation email
							mailer.send(
								constants.confirmEmails.from, 
								req.body.email,
								"Confirm Account",
								html
							).then(function(){
								user.isConfirmed = 0;
								user.confirmOTP = otp;
								// Save user.
								user.save(function (err) {
									if (err) { return apiResponse.ErrorResponse(res, err); }
									return apiResponse.successResponse(res, Strings.staticLabel.en.error.error_22);
								});
							});
						}else{
							return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_20);
						}
					}else{
						return apiResponse.unauthorizedResponse(res, Strings.staticLabel.en.error.error_21);
					}
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}];