import os from 'node:os';
import path from 'node:path';
import test from 'ava';
import fse from 'fs-extra';
import { writeToFile } from '#disk/functions/disk/write-to-file';

let workspaceDir = path.join(os.tmpdir(), 'mprove-write-to-file__create-new');

test.before(async () => {
  await fse.remove(workspaceDir);
  await fse.ensureDir(workspaceDir);
});

test.after.always(async () => {
  await fse.remove(workspaceDir);
});

test('writeToFile creates a new file when path does not exist', async t => {
  let newFilePath = `${workspaceDir}/new-file.txt`;

  await writeToFile({
    filePath: newFilePath,
    content: 'hello'
  });

  let content = await fse.readFile(newFilePath, 'utf8');
  t.is(content, 'hello');
});
