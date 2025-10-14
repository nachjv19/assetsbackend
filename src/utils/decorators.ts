// decoradores para inyectar props por defecto al crear un usuario
export function defaultPropsCreate(defaults: Record<string, any>) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const [payload] = args;
      const merged = { ...defaults, ...payload };
      return original.apply(this, [merged, ...args.slice(1)]);
    };
    return descriptor;
  };
}
