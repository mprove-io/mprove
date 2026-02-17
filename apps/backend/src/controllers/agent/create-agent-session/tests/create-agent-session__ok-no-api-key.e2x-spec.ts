import test from 'ava';
import { forTestsRunAgentSessionE2x } from '#backend/functions/for-tests-run-agent-session-e2x';

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;

  if (!e2bApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_E2B_API_KEY not set');
    return;
  }

  await forTestsRunAgentSessionE2x({
    t,
    testId: 'backend-create-agent-session__ok-no-api-key',
    inspectUI: false,
    projectApiKeys: {
      e2bApiKey
    },
    model: 'opencode/big-pickle'
  });
});
