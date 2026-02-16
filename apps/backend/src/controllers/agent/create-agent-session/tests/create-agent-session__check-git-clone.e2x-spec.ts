import fs from 'node:fs';
import { Sandbox } from '@e2b/code-interpreter';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import { forTestsStartOpencodeServer } from '#backend/functions/for-tests-start-opencode-server';
import { prepareTest } from '#backend/functions/prepare-test';
import { Prep } from '#backend/interfaces/prep';
import { SandboxService } from '#backend/services/sandbox.service';

test('1', async t => {
  let prep: Prep = await prepareTest({});

  let sandboxService = prep.moduleRef.get<SandboxService>(SandboxService);

  let e2bApiKey = prep.cs.get<BackendConfig['demoProjectE2bApiKey']>(
    'demoProjectE2bApiKey'
  );

  let gitUrl = prep.cs.get<BackendConfig['demoProjectRemoteGitUrl']>(
    'demoProjectRemoteGitUrl'
  );

  let privateKeyEncryptedPath = prep.cs.get<
    BackendConfig['demoProjectRemotePrivateKeyEncryptedPath']
  >('demoProjectRemotePrivateKeyEncryptedPath');

  let publicKeyPath = prep.cs.get<
    BackendConfig['demoProjectRemotePublicKeyPath']
  >('demoProjectRemotePublicKeyPath');

  let passPhrase = prep.cs.get<BackendConfig['demoProjectRemotePassPhrase']>(
    'demoProjectRemotePassPhrase'
  );

  if (!e2bApiKey) {
    await prep.app.close();
    t.fail('demoProjectE2bApiKey not set');
    return;
  }

  if (!gitUrl) {
    await prep.app.close();
    t.fail('demoProjectRemoteGitUrl not set');
    return;
  }

  if (!privateKeyEncryptedPath) {
    await prep.app.close();
    t.fail('demoProjectRemotePrivateKeyEncryptedPath not set');
    return;
  }

  if (!publicKeyPath) {
    await prep.app.close();
    t.fail('demoProjectRemotePublicKeyPath not set');
    return;
  }

  if (!passPhrase) {
    await prep.app.close();
    t.fail('demoProjectRemotePassPhrase not set');
    return;
  }

  let privateKeyEncrypted = fs.readFileSync(privateKeyEncryptedPath, 'utf-8');
  let publicKey = fs.readFileSync(publicKeyPath, 'utf-8');

  let templateName =
    prep.cs.get<BackendConfig['e2bPublicTemplate']>('e2bPublicTemplate');

  let sandbox: Sandbox;

  try {
    console.log(`Creating sandbox from template: ${templateName}`);

    sandbox = await Sandbox.create(templateName, {
      apiKey: e2bApiKey,
      timeoutMs: 5 * 60 * 1000
    });

    console.log(`Sandbox created: ${sandbox.sandboxId}`);

    // Clone repo
    console.log('Cloning repo...');
    await sandboxService.cloneRepoInSandbox({
      sandbox: sandbox,
      gitUrl: gitUrl,
      defaultBranch: 'main',
      publicKey: publicKey,
      privateKeyEncrypted: privateKeyEncrypted,
      passPhrase: passPhrase,
      cloneDir: '/home/user/project'
    });

    // Verify clone succeeded
    let lsResult = await sandbox.commands.run('ls /home/user/project');

    console.log(`ls /home/user/project: ${lsResult.stdout.trim()}`);

    t.is(lsResult.exitCode, 0, 'project directory should exist after clone');

    t.true(
      lsResult.stdout.trim().length > 0,
      'project directory should not be empty'
    );

    // Verify SSH keys are cleaned up
    let lsTmpResult = await sandbox.commands.run('ls /tmp');

    t.false(
      lsTmpResult.stdout.includes('ssh-keys'),
      'SSH keys directory should not exist after clone'
    );

    // Start opencode server and verify it can list cloned files
    console.log('Starting opencode server...');
    let { client } = await forTestsStartOpencodeServer({
      sandbox,
      cwd: '/home/user/project'
    });

    console.log('Listing files via opencode SDK...');
    let { data: files, response: filesRes } = await client.file.list({
      query: { path: '.' }
    });

    console.log(`file.list status: ${filesRes.status}`);
    console.log(`file.list: ${JSON.stringify(files)}`);

    t.true(
      Array.isArray(files) && files.length > 0,
      'file list should not be empty'
    );
  } finally {
    if (sandbox) {
      await Sandbox.kill(sandbox.sandboxId, { apiKey: e2bApiKey });
      console.log(`Sandbox killed: ${sandbox.sandboxId}`);
    }

    await prep.app.close();
  }
});
