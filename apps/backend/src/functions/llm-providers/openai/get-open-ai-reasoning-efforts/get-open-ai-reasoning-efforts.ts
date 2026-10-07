import {
  GPT5_FAMILY_RE,
  GPT5_PRO_RE,
  GPT5_VERSIONED_PRO_RE
} from '#backend/functions/llm-providers/openai/constants';
import { getGpt5Version } from '#backend/functions/llm-providers/openai/get-open-ai-reasoning-efforts/get-gpt5-version/get-gpt5-version';
import type { OpenAiModelVariant } from '#backend/types/openai-model-variant';

export type { OpenAiModelVariant } from '#backend/types/openai-model-variant';

const WIDELY_SUPPORTED_EFFORTS: OpenAiModelVariant[] = [
  'low',
  'medium',
  'high'
];
export function getOpenAiReasoningEfforts(item: {
  modelId: string;
  releaseDate: string;
}): OpenAiModelVariant[] {
  let { modelId, releaseDate } = item;
  let normalizedId: string = modelId.toLowerCase();
  if (normalizedId.includes('deep-research')) {
    return ['medium'];
  }
  let isGpt5Family: boolean = GPT5_FAMILY_RE.test(normalizedId);
  let isChat: boolean = normalizedId.includes('-chat');
  if (isGpt5Family && isChat) {
    let version: number | undefined = getGpt5Version({ modelId: normalizedId });
    return version === undefined ? [] : ['medium'];
  }
  let isPro: boolean = GPT5_PRO_RE.test(normalizedId);
  if (isPro) {
    return ['high'];
  }
  let isCodex: boolean = normalizedId.includes('codex');
  if (isGpt5Family && isCodex) {
    let version: number | undefined = getGpt5Version({ modelId: normalizedId });
    if (version !== undefined && version >= 3) {
      return ['none', ...WIDELY_SUPPORTED_EFFORTS, 'xhigh'];
    }
    let supportsXhigh: boolean =
      normalizedId.includes('codex-max') ||
      (version !== undefined && version >= 2);
    return supportsXhigh
      ? [...WIDELY_SUPPORTED_EFFORTS, 'xhigh']
      : [...WIDELY_SUPPORTED_EFFORTS];
  }
  let isVersionedPro: boolean = GPT5_VERSIONED_PRO_RE.test(normalizedId);
  if (isVersionedPro) {
    return ['medium', 'high', 'xhigh'];
  }
  let version: number | undefined = getGpt5Version({ modelId: normalizedId });
  if (version === 1) {
    return ['none', ...WIDELY_SUPPORTED_EFFORTS];
  }
  if (version !== undefined) {
    return ['none', ...WIDELY_SUPPORTED_EFFORTS, 'xhigh'];
  }
  let efforts: OpenAiModelVariant[] = [...WIDELY_SUPPORTED_EFFORTS];
  if (isGpt5Family) {
    efforts.unshift('minimal');
  }
  if (releaseDate >= '2025-11-13') {
    efforts.unshift('none');
  }
  if (releaseDate >= '2025-12-04') {
    efforts.push('xhigh');
  }
  return efforts;
}
