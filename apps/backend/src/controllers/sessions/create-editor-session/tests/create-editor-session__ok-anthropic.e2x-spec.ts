import test from 'ava';
import { forTestsRunEditorSessionE2x } from '#backend/functions/for-tests/for-tests-run-editor-session-e2x';

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;
  if (!e2bApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_E2B_API_KEY not set');
    return;
  }

  let anthropicApiKey = process.env.BACKEND_DEMO_PROJECT_ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_ANTHROPIC_API_KEY not set');
    return;
  }

  await forTestsRunEditorSessionE2x({
    t,
    testId: 'backend-create-editor-session__ok-anthropic',
    inspectUI: false,
    projectApiKeys: {
      e2bApiKey,
      anthropicApiKey
    },
    model: 'opencode/big-pickle', // not anthropic model
    variant: 'default'
  });
});
