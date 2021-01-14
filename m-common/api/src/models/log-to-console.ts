import * as util from 'util';

export function logToConsole(object: any) {
  if (process.env.MPROVE_LOG_TYPE === 'DEV') {
    console.log(util.inspect(object, false, null, true));
  } else {
    console.log(JSON.stringify(util.inspect(object, false, null, false)));
  }
}
