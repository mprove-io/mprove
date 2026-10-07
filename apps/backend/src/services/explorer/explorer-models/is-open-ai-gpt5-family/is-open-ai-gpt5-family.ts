import { GPT5_FAMILY_RE } from '#backend/functions/llm-providers/openai/constants';
export function isOpenAiGpt5Family(item: { modelId: string }): boolean {
  let { modelId } = item;
  let isGpt5Family: boolean = GPT5_FAMILY_RE.test(modelId.toLowerCase());
  return isGpt5Family;
}
