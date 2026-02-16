import { Sandbox } from '@e2b/code-interpreter';
import { createOpencodeClient } from '@opencode-ai/sdk';
import test from 'ava';
import { BackendConfig } from '#backend/config/backend-config';
import { forTestsStartOpencodeServer } from '#backend/functions/for-tests-start-opencode-server';
import { prepareTest } from '#backend/functions/prepare-test';
import { Prep } from '#backend/interfaces/prep';

test('1', async t => {
  let prep: Prep = await prepareTest({});

  let e2bApiKey = prep.cs.get<BackendConfig['demoProjectE2bApiKey']>(
    'demoProjectE2bApiKey'
  );

  if (!e2bApiKey) {
    await prep.app.close();
    t.fail('demoProjectE2bApiKey not set');
    return;
  }

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

    // Check git is installed
    console.log('Checking git...');
    let gitResult = await sandbox.commands.run('git --version');
    t.is(gitResult.exitCode, 0, 'git should be installed');
    t.true(
      gitResult.stdout.includes('git version'),
      'git --version should return version string'
    );

    // Check mprove CLI is installed
    console.log('Checking mprove...');
    let mproveResult = await sandbox.commands.run('mprove version');
    console.log(`mprove: ${mproveResult.stdout.trim()}`);
    t.is(mproveResult.exitCode, 0, 'mprove should be installed');
    t.true(
      mproveResult.stdout.includes('mproveCLI'),
      'mprove version should return mproveCLI'
    );

    // Check opencode binary exists
    console.log('Checking opencode...');
    let whichResult = await sandbox.commands.run('which opencode');
    t.is(whichResult.exitCode, 0, 'opencode binary should exist');

    let opencodeVersionResult =
      await sandbox.commands.run('opencode --version');
    console.log(
      `opencode: ${opencodeVersionResult.stdout.trim() || opencodeVersionResult.stderr.trim()}`
    );

    // Create project directory (no git clone in this test)
    await sandbox.commands.run('mkdir -p /home/user/project');

    // Start opencode server with basic auth
    console.log('Starting opencode server...');
    let { baseUrl, client } = await forTestsStartOpencodeServer({
      sandbox,
      cwd: '/home/user/project'
    });

    // Verify no access without auth
    console.log('Verifying unauthenticated request is rejected...');
    let unauthClient = createOpencodeClient({
      baseUrl,
      directory: '/home/user/project'
    });

    let { response: unauthRes } = await unauthClient.config.get();
    t.is(unauthRes.status, 401, 'should reject unauthenticated requests');

    // Verify access with auth
    console.log('Verifying authenticated request succeeds...');

    let { data: config } = await client.config.get();
    t.truthy(config, 'should return config with valid auth');

    // Verify agents are available
    console.log('Verifying agents are available...');
    let { data: agents } = await client.app.agents();
    t.truthy(agents, 'agents list should be returned');

    console.log('All checks passed');
  } finally {
    if (sandbox) {
      await Sandbox.kill(sandbox.sandboxId, { apiKey: e2bApiKey });
      console.log(`Sandbox killed: ${sandbox.sandboxId}`);
    }

    await prep.app.close();
  }
});
