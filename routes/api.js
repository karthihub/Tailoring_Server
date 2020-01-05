var express = require("express");
var authRouter = require("./auth");
var shopRouter = require("./shop");

var app = express();

app.use("/auth/", authRouter);
app.use("/shop/", shopRouter);

module.exports = app;