import test from 'ava';
import { OPENAI_MODEL_INFO } from '#backend/controllers/sessions/create-editor-session/tests/openai-model-info.fixture';
import { forTestsRunEditorSessionE2x } from '#backend/functions/for-tests/for-tests-run-editor-session-e2x';
import { OPENAI_PROVIDER_ID } from '#common/constants/providers';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';

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

  await forTestsRunEditorSessionE2x({
    t,
    testId: 'backend-create-editor-session__ok-openai',
    inspectUI: false,
    projectApiKeys: {
      e2bApiKey: e2bApiKey
    },
    provider: {
      providerId: OPENAI_PROVIDER_ID,
      type: ProviderTypeEnum.OpenAI,
      isEnabled: true,
      models: [
        {
          modelId: OPENAI_MODEL_INFO.modelsDev.id,
          name: OPENAI_MODEL_INFO.modelsDev.name,
          providerModelInfo: { ...OPENAI_MODEL_INFO },
          isExplorer: true,
          isBuilder: true
        }
      ],
      options: {
        apiKey: openaiApiKey
      }
    },
    modelId: OPENAI_MODEL_INFO.modelsDev.id,
    variant: 'default'
  });
});
