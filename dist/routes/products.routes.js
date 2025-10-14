"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const router = (0, express_1.Router)();
router.get('/', products_controller_1.getProducts);
router.post('/', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, products_controller_1.createProduct); // solo admin crea
router.patch('/:id', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, products_controller_1.updateProduct);
router.delete('/:id', auth_middlewares_1.authMiddleware, auth_middlewares_1.isAdmin, products_controller_1.deleteProduct);
exports.default = router;
