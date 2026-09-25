export function getLogSorted(item: { log: any }): any {
  let { log } = item;
  if (log.constructor !== Object) {
    return log;
  }

  if (log.response?.info?.constructor === Object) {
    let infoSorted = Object.keys(log.response.info)
      .sort()
      .reduce(function (ac: any, key) {
        ac[key] = log.response.info[key];
        return ac;
      }, {});

    log.response.info = infoSorted;
  }

  if (log.response?.constructor === Object) {
    let responseSorted = Object.keys(log.response)
      .sort()
      .reduce(function (ac: any, key) {
        ac[key] = log.response[key];
        return ac;
      }, {});

    log.response = responseSorted;
  }

  let logSorted = Object.keys(log)
    .sort()
    .reduce(function (ac: any, key) {
      ac[key] = log[key];
      return ac;
    }, {});

  return logSorted;
}
