export function isCodexModelSupportedByOpencode(item: {
  modelId: string;
}): boolean {
  let { modelId } = item;
  let allowedModels: Set<string> = new Set([
    'gpt-5.5',
    'gpt-5.3-codex-spark',
    'gpt-5.4',
    'gpt-5.4-mini'
  ]);
  let isExplicitlyAllowed: boolean = allowedModels.has(modelId);
  if (isExplicitlyAllowed) {
    return true;
  }
  let deniedModels: Set<string> = new Set(['gpt-5.5-pro', 'gpt-5.6']);
  let isExplicitlyDenied: boolean = deniedModels.has(modelId);
  if (isExplicitlyDenied) {
    return false;
  }
  let match: RegExpMatchArray | null = modelId.match(/^gpt-(\d+\.\d+)/);
  let version: number | undefined = match
    ? Number.parseFloat(match[1])
    : undefined;
  let isSupported: boolean = version !== undefined && version > 5.4;
  return isSupported;
}
