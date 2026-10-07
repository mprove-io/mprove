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
