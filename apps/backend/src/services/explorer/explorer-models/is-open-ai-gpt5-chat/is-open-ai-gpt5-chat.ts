import { GPT5_FAMILY_RE } from '#backend/functions/llm-providers/openai/constants';
export function isOpenAiGpt5Chat(item: { modelId: string }): boolean {
  let { modelId } = item;
  let normalizedId: string = modelId.toLowerCase();
  let isGpt5Family: boolean = GPT5_FAMILY_RE.test(normalizedId);
  let isChat: boolean = normalizedId.includes('-chat');
  return isGpt5Family && isChat;
}
