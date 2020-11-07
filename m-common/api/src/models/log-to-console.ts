import * as util from 'util';

export function logToConsole(object: any) {
  console.log(util.inspect(object, false, null, true /* enable colors */));
}
