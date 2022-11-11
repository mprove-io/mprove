import * as util from 'util';

export function logToConsole(item: {
  log: any;
  logIsColor: boolean;
  logIsStringify: boolean;
}) {
  let { log, logIsColor, logIsStringify } = item;

  // let lg = util.inspect(message, false, null, isColor);

  if (logIsStringify === true) {
    console.log(JSON.stringify(log));
  } else {
    console.log(
      util.inspect(log, {
        showHidden: false,
        depth: null,
        colors: logIsColor,
        breakLength: Infinity,
        compact: false
      })
    );
  }
}
