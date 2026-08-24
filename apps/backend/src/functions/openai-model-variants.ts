export type OpenAiModelVariant =
  | 'none'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh';

const WIDELY_SUPPORTED_EFFORTS: OpenAiModelVariant[] = [
  'low',
  'medium',
  'high'
];

const GPT5_FAMILY_RE = /(?:^|\/)gpt-5(?:[.-]|$)/;
const GPT5_VERSION_RE = /(?:^|\/)gpt-5[.-](\d+)(?:[.-]|$)/;
const GPT5_PRO_RE = /(?:^|\/)gpt-5[.-]?pro(?:[.-]|$)/;
const GPT5_VERSIONED_PRO_RE = /(?:^|\/)gpt-5[.-]\d+[.-]pro(?:[.-]|$)/;

export function isOpenAiGpt5Family(item: { modelId: string }): boolean {
  let { modelId } = item;

  let isGpt5Family: boolean = GPT5_FAMILY_RE.test(modelId.toLowerCase());

  return isGpt5Family;
}

export function isOpenAiGpt5Chat(item: { modelId: string }): boolean {
  let { modelId } = item;

  let normalizedId: string = modelId.toLowerCase();

  let isGpt5Family: boolean = GPT5_FAMILY_RE.test(normalizedId);

  let isChat: boolean = normalizedId.includes('-chat');

  return isGpt5Family && isChat;
}

export function isOpenAiGpt5Pro(item: { modelId: string }): boolean {
  let { modelId } = item;

  let normalizedId: string = modelId.toLowerCase();

  let isPro: boolean =
    GPT5_PRO_RE.test(normalizedId) || GPT5_VERSIONED_PRO_RE.test(normalizedId);

  return isPro;
}

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

export function getOpenAiVariantOptions(item: {
  variant: string;
}): Record<string, unknown> {
  let { variant } = item;

  let options: Record<string, unknown> = {
    reasoningEffort: variant,
    reasoningSummary: 'auto',
    include: ['reasoning.encrypted_content']
  };

  return options;
}

function getGpt5Version(item: { modelId: string }): number | undefined {
  let { modelId } = item;

  let match: RegExpExecArray | null = GPT5_VERSION_RE.exec(modelId);

  let version: number | undefined = match ? Number(match[1]) : undefined;

  return version;
}
