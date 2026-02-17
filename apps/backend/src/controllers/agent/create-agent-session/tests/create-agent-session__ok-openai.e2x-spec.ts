import test from 'ava';
import { forTestsRunAgentSessionE2x } from '#backend/functions/for-tests-run-agent-session-e2x';

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  if (!e2bApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_E2B_API_KEY not set');
    return;
  }

  let openaiApiKey = process.env.BACKEND_DEMO_PROJECT_OPENAI_API_KEY;
  if (!openaiApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_OPENAI_API_KEY not set');
    return;
  }

  await forTestsRunAgentSessionE2x({
    t,
    testId: 'backend-create-agent-session__ok-openai',
    inspectUI: false,
    projectApiKeys: {
      e2bApiKey,
      openaiApiKey
    },
    model: 'openai/gpt-5.1-codex-mini'
    // model: 'opencode/big-pickle'
  });
});
