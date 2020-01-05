var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ShopSchema = new Schema({
	shopname: {type: String, required: true},
	description: {type: String, required: true},
	shoplogo: {type: String, required: true},
	mobilenumber: {type: String, required: true},
	emailid: {type: String, required: true},
	shopstatus: {type: String, required: true},
	location: {type: String, required: true},
	_shop_number: {type: String, required: true},
	_shop_street: {type: String, required: true},
	_shop_city: {type: String, required: true},
	_shop_state: {type: String, required: true},
	_shop_postalcode: {type: String, required: true},
	_shop_country: {type: String, required: true}
}, {timestamps: true});

module.exports = mongoose.model("Shop", ShopSchema, "_shop_list_table");