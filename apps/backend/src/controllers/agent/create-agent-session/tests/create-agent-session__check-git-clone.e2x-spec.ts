import fs from 'node:fs';
import { Sandbox } from '@e2b/code-interpreter';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import { prepareTest } from '#backend/functions/prepare-test';
import { Prep } from '#backend/interfaces/prep';
import { SandboxService } from '#backend/services/sandbox.service';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';

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

  if (
    !e2bApiKey ||
    !gitUrl ||
    !privateKeyEncryptedPath ||
    !publicKeyPath ||
    !passPhrase
  ) {
    await prep.app.close();
    t.pass(
      'Skipped: BACKEND_DEMO_PROJECT_E2B_API_KEY, BACKEND_DEMO_PROJECT_GIT_URL, BACKEND_DEMO_PROJECT_PRIVATE_KEY_ENCRYPTED_PATH, BACKEND_DEMO_PROJECT_PUBLIC_KEY_PATH, or BACKEND_DEMO_PROJECT_PASS_PHRASE not set'
    );
    return;
  }

  let privateKeyEncrypted = fs.readFileSync(privateKeyEncryptedPath, 'utf-8');
  let publicKey = fs.readFileSync(publicKeyPath, 'utf-8');

  let project = {
    remoteType: ProjectRemoteTypeEnum.GitClone,
    e2bApiKey: e2bApiKey,
    gitUrl: gitUrl,
    defaultBranch: 'main',
    publicKey: publicKey,
    privateKeyEncrypted: privateKeyEncrypted,
    passPhrase: passPhrase
  } as ProjectTab;

  let sandboxId: string;

  try {
    let result = await sandboxService.createSandbox({
      sandboxType: SandboxTypeEnum.E2B,
      sandboxTimeoutMs: 5 * 60 * 1000,
      agent: 'codex',
      project: project
    });

    sandboxId = result.sandboxId;

    console.log(`Sandbox created with git clone: ${sandboxId}`);

    // Verify clone succeeded
    let lsResult = await result.sandbox.commands.run('ls /home/user/project');

    console.log(`ls /home/user/project: ${lsResult.stdout.trim()}`);

    t.is(lsResult.exitCode, 0, 'project directory should exist after clone');

    t.true(
      lsResult.stdout.trim().length > 0,
      'project directory should not be empty'
    );

    // Verify SSH keys are cleaned up
    let lsTmpResult = await result.sandbox.commands.run('ls /tmp');

    t.false(
      lsTmpResult.stdout.includes('ssh-keys'),
      'SSH keys directory should not exist after clone'
    );
  } finally {
    if (sandboxId) {
      await Sandbox.kill(sandboxId, { apiKey: e2bApiKey });
      console.log(`Sandbox killed: ${sandboxId}`);
    }

    await prep.app.close();
  }
});
