import { isCodexModelSupportedByOpencode } from '#backend/functions/llm-providers/codex/is-codex-model-supported-by-opencode/is-codex-model-supported-by-opencode';
import type { CodexModel } from '#common/types/backend/parts/codex/codex-model';
import type { LlmModelPart } from '#common/types/backend/parts/llm-models/llm-model-part';
export function codexModelToLlmModelPart(item: {
  codexModel: CodexModel;
}): LlmModelPart {
  let { codexModel } = item;
  let isOpencodeSupported: boolean = isCodexModelSupportedByOpencode({
    modelId: codexModel.slug
  });
  let variants: string[] = (codexModel.supported_reasoning_levels ?? []).map(
    level => level.effort
  );
  let modelPart: LlmModelPart = {
    modelId: codexModel.slug,
    catalogName: codexModel.display_name,
    providerModelInfo: { ...codexModel },
    contextLimit: codexModel.context_window ?? codexModel.max_context_window,
    inputLimit: undefined,
    outputLimit: undefined,
    codexContextWindow: codexModel.context_window,
    codexMaxContextWindow: codexModel.max_context_window,
    variants: variants.length > 0 ? variants : undefined,
    isOpencodeSupported: isOpencodeSupported
  };
  return modelPart;
}
