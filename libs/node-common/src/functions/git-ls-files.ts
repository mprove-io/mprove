import { exec } from 'child_process';

export async function gitLsFiles(dir: string) {
  return new Promise(function (resolve, reject) {
    exec('git ls-files', { cwd: dir }, function (error, stdout, stderr) {
      if (error !== null || stderr !== '') {
        reject(error + ' \nstderr: ' + stderr);
        return;
      }

      let paths: string[] = stdout.split('\n').filter(p => p.length !== 0);
      resolve(paths);
    });
  });
}
