import {
  GPT5_PRO_RE,
  GPT5_VERSIONED_PRO_RE
} from '#backend/functions/llm-providers/openai/constants';
export function isOpenAiGpt5Pro(item: { modelId: string }): boolean {
  let { modelId } = item;
  let normalizedId: string = modelId.toLowerCase();
  let isPro: boolean =
    GPT5_PRO_RE.test(normalizedId) || GPT5_VERSIONED_PRO_RE.test(normalizedId);
  return isPro;
}
