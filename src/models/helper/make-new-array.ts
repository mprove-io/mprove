export function makeNewArray<T>(...arr: T[]): T {

  let args = Array.prototype.slice.call(arguments);

  let result: any = [];

  args.forEach((element: any) => {
    result = result.concat(element);
  });

  return result;
}
