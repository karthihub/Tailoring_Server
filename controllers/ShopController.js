const Shop = require("../models/ShopModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const Strings = require("../helpers/Strings");

// Shop Schema
function ShopData(data) {
	this.id = data._id;
	this.createdAt = data.createdAt;
	this.shopname = data.shopname;
	this.description = data.description;
	this.shoplogo = data.shoplogo;
	this.mobilenumber = data.mobilenumber;
	this.emailid = data.emailid;
	this.shopstatus = data.shopstatus;
	this.location = data.location;
	this._shop_number = data._shop_number;
	this._shop_street = data._shop_street;
	this._shop_city = data._shop_city;
	this._shop_state = data._shop_state;
	this._shop_postalcode = data._shop_postalcode;
	this._shop_country = data._shop_country;
}

/**
 * Shop List.
 * 
 * @returns {Object}
 */
exports.ShopList = [
	auth,
	function (req, res) {
		try {
			Shop.find().then((shops)=>{
				if(shops.length > 0){
					return apiResponse.successResponseWithData(res, Strings.staticLabel.en.error.error_23, shops);
				}else{
					return apiResponse.successResponseWithData(res, Strings.staticLabel.en.error.error_11, []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Shop Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.shopDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res,  Strings.staticLabel.en.error.error_11, {});
		}
		try {
			Shop.findOne({_id: req.params.id}).then((shop)=>{                
				if(shop !== null){
					let shopData = new ShopData(shop);
					return apiResponse.successResponseWithData(res,  Strings.staticLabel.en.error.error_23, shopData);
				}else{
					return apiResponse.successResponseWithData(res,  Strings.staticLabel.en.error.error_11, {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Register New Shop.
 *
 * @param {string}      _shop_name 
 * @param {string}      _shop_desc
 * @param {string}      _shop_logo
 * @param {string}      _shop_mob
 * @param {string}      _shop_emailid
 * @param {string}      _shop_status
 * @param {string}      _shop_location
 * @param {string}      _shop_number
 * @param {string}      _shop_street
 * @param {string}      _shop_city
 * @param {string}      _shop_state
 * @param {string}      _shop_postalcode
 * @param {string}      _shop_country
 * 
 * @returns {Object}
 */
exports.shopStore = [
	auth,
	body("_shop_name", Strings.staticLabel.en.error.error_24).isLength({ min: 1 }).trim(),
	body("_shop_desc", Strings.staticLabel.en.error.error_25).isLength({ min: 1 }).trim(),
	body("_shop_logo", Strings.staticLabel.en.error.error_26).isLength({ min: 1 }).trim(),
	body("_shop_emailid", Strings.staticLabel.en.error.error_27).isLength({ min: 1 }).trim(),
	body("_shop_status", Strings.staticLabel.en.error.error_28).isLength({ min: 1 }).trim(),
	body("_shop_location", Strings.staticLabel.en.error.error_29).isLength({ min: 1 }).trim(),
	body("_shop_number", Strings.staticLabel.en.error.error_30).isLength({ min: 1 }).trim(),
	body("_shop_street", Strings.staticLabel.en.error.error_31).isLength({ min: 1 }).trim(),
	body("_shop_city", Strings.staticLabel.en.error.error_32).isLength({ min: 1 }).trim(),
	body("_shop_state", Strings.staticLabel.en.error.error_33).isLength({ min: 1 }).trim(),
	body("_shop_postalcode", Strings.staticLabel.en.error.error_34).isLength({ min: 1 }).trim(),
	body("_shop_country", Strings.staticLabel.en.error.error_35).isLength({ min: 1 }).trim(),
	body("_shop_mob", Strings.staticLabel.en.error.error_36).isLength({ min: 10 }).trim().custom((value,{req}) => {
		return Shop.findOne({_shop_mob : _shop_mob}).then(shop => {
			if (shop) {
				return Promise.reject(Strings.staticLabel.en.error.error_37);
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req); 
			var shop = new Shop(
				{ 
					_shop_name: req.body._shop_name,
					_shop_desc: req.body._shop_desc,
					_shop_logo: req.body._shop_logo,
					_shop_emailid: req.body._shop_emailid,
					_shop_status: req.body._shop_status,
					_shop_location: req.body._shop_location,
					_shop_number: req.body._shop_number,
					_shop_street: req.body._shop_street,
					_shop_city: req.body._shop_city,
					_shop_state: req.body._shop_state,
					_shop_postalcode: req.body._shop_postalcode,
					_shop_country: req.body._shop_country,
					_shop_mob: req.body._shop_mob
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save Shop.
				shop.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let shopData = new ShopData(shop);
					return apiResponse.successResponseWithData(res,"Shop add Success.", shopData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Shop update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.shopUpdate = [
	auth,

	body("_shop_name", Strings.staticLabel.en.error.error_24).isLength({ min: 1 }).trim(),
	body("_shop_desc", Strings.staticLabel.en.error.error_25).isLength({ min: 1 }).trim(),
	body("_shop_logo", Strings.staticLabel.en.error.error_26).isLength({ min: 1 }).trim(),
	body("_shop_emailid", Strings.staticLabel.en.error.error_27).isLength({ min: 1 }).trim(),
	body("_shop_status", Strings.staticLabel.en.error.error_28).isLength({ min: 1 }).trim(),
	body("_shop_location", Strings.staticLabel.en.error.error_29).isLength({ min: 1 }).trim(),
	body("_shop_number", Strings.staticLabel.en.error.error_30).isLength({ min: 1 }).trim(),
	body("_shop_street", Strings.staticLabel.en.error.error_31).isLength({ min: 1 }).trim(),
	body("_shop_city", Strings.staticLabel.en.error.error_32).isLength({ min: 1 }).trim(),
	body("_shop_state", Strings.staticLabel.en.error.error_33).isLength({ min: 1 }).trim(),
	body("_shop_postalcode", Strings.staticLabel.en.error.error_34).isLength({ min: 1 }).trim(),
	body("_shop_country", Strings.staticLabel.en.error.error_35).isLength({ min: 1 }).trim(),
	body("_shop_mob", Strings.staticLabel.en.error.error_36).isLength({ min: 10 }).trim(),

	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var shop = new Shop(
				{ 
					_shop_name: req.body._shop_name,
					_shop_desc: req.body._shop_desc,
					_shop_logo: req.body._shop_logo,
					_shop_emailid: req.body._shop_emailid,
					_shop_status: req.body._shop_status,
					_shop_location: req.body._shop_location,
					_shop_number: req.body._shop_number,
					_shop_street: req.body._shop_street,
					_shop_city: req.body._shop_city,
					_shop_state: req.body._shop_state,
					_shop_postalcode: req.body._shop_postalcode,
					_shop_country: req.body._shop_country,
					_shop_mob: req.body._shop_mob
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Shop.findById(req.params.id, function (err, foundShop) {
						if(foundShop === null){
							return apiResponse.notFoundResponse(res,"Shop not exists with this id");
						}else{
							//Check authorized user
							if(foundShop.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update Shop.
								Shop.findByIdAndUpdate(req.params.id, shop, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let shopData = new ShopData(shop);
										return apiResponse.successResponseWithData(res,"Shop update Success.", shopData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Shop Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.shopDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Shop.findById(req.params.id, function (err, foundShop) {
				if(foundShop === null){
					return apiResponse.notFoundResponse(res,"Shop not exists with this id");
				}else{
					//Check authorized user
					if(foundShop.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete Shop.
						Shop.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Shop delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];