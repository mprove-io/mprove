const GPT5_VERSION_RE = /(?:^|\/)gpt-5[.-](\d+)(?:[.-]|$)/;
export function getGpt5Version(item: { modelId: string }): number | undefined {
  let { modelId } = item;
  let match: RegExpExecArray | null = GPT5_VERSION_RE.exec(modelId);
  let version: number | undefined = match ? Number(match[1]) : undefined;
  return version;
}
