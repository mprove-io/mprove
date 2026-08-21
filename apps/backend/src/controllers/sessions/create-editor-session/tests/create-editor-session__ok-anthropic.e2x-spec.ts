import test from 'ava';
import { forTestsRunEditorSessionE2x } from '#backend/functions/for-tests/for-tests-run-editor-session-e2x';
import { ANTHROPIC_PROVIDER_ID } from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';

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
      e2bApiKey: e2bApiKey
    },
    provider: {
      providerId: ANTHROPIC_PROVIDER_ID,
      type: ProviderTypeEnum.Anthropic,
      isEnabled: true,
      models: [
        {
          modelId: 'claude-sonnet-4-5',
          name: 'Claude Sonnet 4.5',
          isExplorer: true,
          isBuilder: true
        }
      ],
      options: {
        apiKey: anthropicApiKey
      }
    },
    modelId: 'claude-sonnet-4-5',
    variant: 'default'
  });
});
