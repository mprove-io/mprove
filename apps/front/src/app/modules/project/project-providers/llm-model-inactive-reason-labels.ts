import { LlmModelInactiveReasonEnum } from '#common/enums/llm-model-inactive-reason.enum';

export const LLM_MODEL_INACTIVE_REASON_LABELS: Record<
  LlmModelInactiveReasonEnum,
  string
> = {
  OpencodeModelFiltered: 'OpenCode filters out this model',
  OpencodeProviderUnsupported: 'OpenCode does not support this provider',
  OpencodePackageUnsupported: 'OpenCode does not support the provider package',
  OpencodeConfigUnsupported:
    'OpenCode cannot represent this model configuration'
};
