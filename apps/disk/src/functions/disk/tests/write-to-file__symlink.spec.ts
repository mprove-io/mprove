import os from 'node:os';
import path from 'node:path';
import { Result } from '@praha/byethrow';
import test from 'ava';
import fse from 'fs-extra';
import { DiskFileIsSymlinkError } from '#disk/functions/disk/errors/disk-file-is-symlink-error';
import { writeToFile } from '#disk/functions/disk/write-to-file';

let workspaceDir = path.join(os.tmpdir(), 'mprove-write-to-file__symlink');

test.before(async () => {
  await fse.remove(workspaceDir);
  await fse.ensureDir(workspaceDir);
});

test.after.always(async () => {
  await fse.remove(workspaceDir);
});

test('writeToFile rejects a symlink and does not modify its target', async t => {
  let secretContent = 'SECRET';
  let secretPath = `${workspaceDir}/secret.txt`;
  let symlinkPath = `${workspaceDir}/link.txt`;

  await fse.writeFile(secretPath, secretContent);
  await fse.symlink(secretPath, symlinkPath);

  let error = await Result.unwrapError(
    writeToFile({
      filePath: symlinkPath,
      content: 'OVERWRITTEN'
    })
  );

  t.true(error instanceof DiskFileIsSymlinkError);

  let targetContent = await fse.readFile(secretPath, 'utf8');

  t.is(
    targetContent,
    secretContent,
    'writeToFile must not overwrite the symlink target file'
  );
});
