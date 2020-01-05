var express = require("express");
const ShopController = require("../controllers/ShopController");

var router = express.Router();

router.get("/", ShopController.shopList);
router.get("/:id", ShopController.shopDetail);
router.post("/", ShopController.shopStore);
router.put("/:id", ShopController.shopUpdate);
router.delete("/:id", ShopController.shopDelete);

module.exports = router;