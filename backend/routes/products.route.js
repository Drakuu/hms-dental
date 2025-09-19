const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller")

// router.use();

router.post('/', controller.Product.addProduct);
router.get('/', controller.Product.getProducts);
router.put('/:id', controller.Product.updateProduct);
router.delete('/:id', controller.Product.deleteProduct);

module.exports = router;
