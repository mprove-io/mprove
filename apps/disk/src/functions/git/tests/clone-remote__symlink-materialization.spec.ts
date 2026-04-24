import os from 'node:os';
import path from 'node:path';
import test from 'ava';
import fse from 'fs-extra';
import { simpleGit } from 'simple-git';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { cloneRemote } from '#disk/functions/git/clone-remote';

let workspaceDir = path.join(
  os.tmpdir(),
  'mprove-clone-remote__symlink-materialization'
);

test.before(async () => {
  await fse.remove(workspaceDir);
  await fse.ensureDir(workspaceDir);
});

test.after.always(async () => {
  await fse.remove(workspaceDir);
});

test('cloneRemote must not materialise user-controlled symlinks on disk', async t => {
  let bareDir = `${workspaceDir}/src-bare.git`;
  let srcWorkDir = `${workspaceDir}/src-work`;
  let orgPath = `${workspaceDir}/dst`;
  let orgId = 'test-org';
  let projectId = 'test-project';
  let repoId = 'r1';
  let keyDir = `${workspaceDir}/keys`;

  await fse.ensureDir(bareDir);
  await simpleGit({ baseDir: bareDir }).init(true, ['--initial-branch=main']);

  await fse.ensureDir(srcWorkDir);
  let srcGit = simpleGit({ baseDir: srcWorkDir });
  await srcGit.init(false, ['--initial-branch=main']);
  await srcGit.addConfig('user.email', 'test@test');
  await srcGit.addConfig('user.name', 'test');
  await srcGit.addConfig('core.symlinks', 'true');

  await fse.writeFile(`${srcWorkDir}/normal.txt`, 'ok');
  await fse.symlink('/etc/hostname', `${srcWorkDir}/leak.view`);
  await srcGit.add(['normal.txt', 'leak.view']);
  await srcGit.commit('initial');
  await srcGit.addRemote('origin', bareDir);
  await srcGit.push('origin', 'main');

  await fse.ensureDir(keyDir);

  await cloneRemote({
    orgId: orgId,
    projectId: projectId,
    repoId: repoId,
    orgPath: orgPath,
    remoteType: ProjectRemoteTypeEnum.GitClone,
    gitUrl: bareDir,
    keyDir: keyDir,
    privateKeyEncrypted: '',
    publicKey: '',
    passPhrase: ''
  });

  let clonedLeakPath = `${orgPath}/${orgId}/${projectId}/${repoId}/leak.view`;
  let stat = await fse.lstat(clonedLeakPath);

  t.false(
    stat.isSymbolicLink(),
    'cloneRemote must not materialise a real symlink on disk from a user-controlled remote — such a symlink would let subsequent reads escape the repo'
  );

  let clonedLeakContent = await fse.readFile(clonedLeakPath, 'utf8');
  t.is(
    clonedLeakContent,
    '/etc/hostname',
    'with core.symlinks=false git stores the link target path as plain text — confirms the guard is active, not just that the symlink happened to be missing'
  );
});
