"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const logger_1 = require("../utils/logger");
const getProducts = async (req, res) => {
    try {
        const { brand, category } = req.query;
        const filter = {};
        if (brand)
            filter.brand = brand;
        if (category)
            filter.category = category;
        const prods = await Product_1.default.find(filter).lean();
        logger_1.logger.logHttp('GET', '/products', { filter, count: prods.length });
        res.json(prods);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const { sku, name, price, quantity, brand, category, imageUrl } = req.body;
        if (!sku || !name)
            return res.status(400).json({ message: 'Missing sku or name' });
        const exists = await Product_1.default.findOne({ sku });
        if (exists)
            return res.status(409).json({ message: 'SKU already exists' });
        if (price < 0 || quantity < 0)
            return res.status(400).json({ message: 'Negative numbers not allowed' });
        const product = await Product_1.default.create({
            sku,
            name,
            price,
            quantity,
            brand,
            category,
            imageUrl
        });
        logger_1.logger.logHttp('POST', '/products', { id: product._id, sku: product.sku });
        res.status(201).json(product);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.sku) {
            const other = await Product_1.default.findOne({ sku: updates.sku, _id: { $ne: id } });
            if (other)
                return res.status(409).json({ message: 'SKU already in use' });
        }
        const updated = await Product_1.default.findByIdAndUpdate(id, updates, { new: true });
        logger_1.logger.logHttp('PATCH', `/products/${id}`, { updated: !!updated });
        if (!updated)
            return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const removed = await Product_1.default.findByIdAndDelete(id);
        logger_1.logger.logHttp('DELETE', `/products/${id}`, { removed: !!removed });
        if (!removed)
            return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteProduct = deleteProduct;
