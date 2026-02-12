import { Sandbox } from '@e2b/code-interpreter';
import test from 'ava';
import crypto from 'crypto';
import { type AgentListResponse } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
import { prepareTest } from '#backend/functions/prepare-test';
import { Prep } from '#backend/interfaces/prep';

test('1', async t => {
  let prep: Prep = await prepareTest({});

  let e2bApiKey = prep.cs.get<BackendConfig['demoProjectE2bApiKey']>(
    'demoProjectE2bApiKey'
  );

  if (!e2bApiKey) {
    await prep.app.close();
    t.pass('Skipped: demoProjectE2bApiKey not set');
    return;
  }

  let templateName =
    prep.cs.get<BackendConfig['e2bPublicTemplate']>('e2bPublicTemplate');

  console.log(`Using template: ${templateName}`);

  let sandbox: Sandbox;

  try {
    sandbox = await Sandbox.create(templateName, {
      apiKey: e2bApiKey,
      timeoutMs: 5 * 60 * 1000
    });

    console.log(`Sandbox created: ${sandbox.sandboxId}`);

    // Check git is installed
    let gitResult = await sandbox.commands.run('git --version');

    console.log(`git: ${gitResult.stdout.trim()}`);

    t.is(gitResult.exitCode, 0, 'git should be installed');

    t.true(
      gitResult.stdout.includes('git version'),
      'git --version should return version string'
    );

    // Check mprove CLI is installed
    let mproveResult = await sandbox.commands.run('mprove version');

    console.log(`mprove: ${mproveResult.stdout.trim()}`);

    t.is(mproveResult.exitCode, 0, 'mprove should be installed');

    t.true(
      mproveResult.stdout.includes('mproveCLI'),
      'mprove version should return mproveCLI'
    );

    // Check sandbox-agent binary exists
    let whichResult = await sandbox.commands.run('which sandbox-agent');

    console.log(`sandbox-agent path: ${whichResult.stdout.trim()}`);

    t.is(whichResult.exitCode, 0, 'sandbox-agent binary should exist');

    // Start sandbox-agent server
    let sandboxAgentToken = crypto.randomBytes(32).toString('hex');

    await sandbox.commands.run(
      `sandbox-agent server --no-telemetry --token ${sandboxAgentToken} --host 0.0.0.0 --port 3000`,
      { background: true, timeoutMs: 0 }
    );

    // Health check
    let host = sandbox.getHost(3000);

    let healthy = false;

    for (let i = 0; i < 30; i++) {
      try {
        let res = await fetch(`https://${host}/v1/health`, {
          headers: { Authorization: `Bearer ${sandboxAgentToken}` }
        });
        if (res.ok) {
          healthy = true;
          break;
        }
      } catch {
        // retry
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    t.true(healthy, 'sandbox-agent server should become healthy');

    // Verify agents are available
    let agentsRes = await fetch(`https://${host}/v1/agents`, {
      headers: { Authorization: `Bearer ${sandboxAgentToken}` }
    });

    t.true(agentsRes.ok, '/v1/agents should respond ok');

    let agentsData: AgentListResponse = await agentsRes.json();

    let installedAgents = agentsData.agents.filter(a => a.installed);
    console.dir(installedAgents, { depth: null });

    for (let id of [
      // 'claude',
      'codex',
      'opencode'
    ]) {
      let agent = agentsData.agents.find(a => a.id === id);
      t.truthy(agent, `${id} agent should be available`);
      if (agent) {
        t.true(agent.installed, `${id} agent should be installed`);
      }
    }
  } finally {
    if (sandbox) {
      await Sandbox.kill(sandbox.sandboxId, { apiKey: e2bApiKey });
      console.log(`Sandbox killed: ${sandbox.sandboxId}`);
    }

    await prep.app.close();
  }
});
