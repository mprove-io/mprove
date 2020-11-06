import * as fse from 'fs-extra';

export function logOutputToFile(logPath: string, log: any) {
  if (process.env.MPROVE_LOG_IO !== 'TRUE') {
    return;
  }

  let path = `${logPath}_out.log`;

  let str = JSON.stringify(log, null, 2);

  fse.writeFileSync(path, str);
}
