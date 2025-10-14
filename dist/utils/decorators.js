"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPropsCreate = defaultPropsCreate;
// decoradores para inyectar props por defecto al crear un usuario
function defaultPropsCreate(defaults) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = async function (...args) {
            const [payload] = args;
            const merged = { ...defaults, ...payload };
            return original.apply(this, [merged, ...args.slice(1)]);
        };
        return descriptor;
    };
}
