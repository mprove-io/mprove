import test from 'ava';
import { forTestsRunEditorSessionE2x } from '#backend/functions/for-tests/for-tests-run-editor-session-e2x';
import { ZEN_PROVIDER_ID } from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';

test('1', async t => {
  let e2bApiKey = process.env.BACKEND_DEMO_PROJECT_E2B_API_KEY;

  if (!e2bApiKey) {
    t.fail('BACKEND_DEMO_PROJECT_E2B_API_KEY not set');
    return;
  }

  await forTestsRunEditorSessionE2x({
    t,
    testId: 'backend-create-editor-session__ok-no-api-key',
    inspectUI: false,
    projectApiKeys: {
      e2bApiKey: e2bApiKey
    },
    provider: {
      providerId: ZEN_PROVIDER_ID,
      type: ProviderTypeEnum.OpenAICompatible,
      name: 'OpenCode',
      isEnabled: true,
      models: [
        {
          modelId: 'big-pickle',
          name: 'Big Pickle',
          isExplorer: true,
          isBuilder: true
        }
      ],
      options: {
        baseURL: 'https://opencode.ai/zen/v1'
      }
    },
    modelId: 'big-pickle',
    variant: 'default'
  });
});
