export function anthropicUsesSummarizedThinking(item: {
  modelId: string;
}): boolean {
  let { modelId } = item;
  let normalizedId: string = modelId.toLowerCase();
  if (!normalizedId.includes('claude-')) {
    return false;
  }
  let version: RegExpExecArray | null =
    /claude-(?:[a-z]+-)?(\d+)(?:[.-](\d{1,2}))?(?:[.@-]|$)/i.exec(normalizedId);
  if (!version) {
    return true;
  }
  let major: number = Number(version[1]);
  let minor: number = Number(version[2] ?? 0);
  let usesSummarizedThinking: boolean =
    major > 4 || (major === 4 && minor >= 7);
  return usesSummarizedThinking;
}
