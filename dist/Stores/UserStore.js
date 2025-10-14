"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStore = void 0;
const User_1 = __importDefault(require("../models/User"));
const decorators_1 = require("../utils/decorators");
const logger_1 = require("../utils/logger");
// Clase que expone los CRUD: list, findByName, create, update, remove
class UserStore {
    // lista todos los usuarios
    async list() {
        const users = await User_1.default.find().lean();
        logger_1.logger.logHttp('GET', '/users', { resultCount: users.length });
        return users;
    }
    async findByName(username) {
        const user = await User_1.default.findOne({ username }).lean();
        logger_1.logger.logHttp('GET', `/users?username=${username}`, { found: !!user });
        return user;
    }
    async create(payload) {
        // payload ya tiene role y createdAt gracias al decorador
        const created = await User_1.default.create(payload);
        logger_1.logger.logHttp('POST', '/users', { id: created._id, username: created.username });
        return created;
    }
    async update(id, data) {
        const updated = await User_1.default.findByIdAndUpdate(id, data, { new: true });
        logger_1.logger.logHttp('PATCH', `/users/${id}`, { updated: !!updated });
        return updated;
    }
    async remove(id) {
        const res = await User_1.default.findByIdAndDelete(id);
        logger_1.logger.logHttp('DELETE', `/users/${id}`, { deleted: !!res });
        return !!res;
    }
}
exports.UserStore = UserStore;
__decorate([
    (0, decorators_1.defaultPropsCreate)({ role: 'user', createdAt: Date.now(), isActive: true })
], UserStore.prototype, "create", null);
