import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';

export function getLlmModelVariantsError(item: {
  variants: LlmModelVariant[];
  isExplorer: boolean;
  isBuilder: boolean;
}): string | undefined {
  let { variants, isExplorer, isBuilder } = item;

  let variantNames: string[] = variants.map(variant => variant.variant.trim());

  let hasEmptyVariantName: boolean = variantNames.some(
    variantName => variantName.length === 0
  );

  if (hasEmptyVariantName) {
    return 'Variant name is required.';
  }

  let normalizedVariantNames: string[] = variantNames.map(variantName =>
    variantName.toLocaleLowerCase()
  );

  let uniqueVariantNames: Set<string> = new Set(normalizedVariantNames);

  if (uniqueVariantNames.size !== normalizedVariantNames.length) {
    return 'Variant name must be unique.';
  }

  let destinations: {
    label: string;
    enabled: boolean;
    enabledKey: 'isExplorer' | 'isBuilder';
  }[] = [
    {
      label: 'Explorer',
      enabled: isExplorer,
      enabledKey: 'isExplorer'
    },
    {
      label: 'Builder',
      enabled: isBuilder,
      enabledKey: 'isBuilder'
    }
  ];

  let invalidDestination = destinations.find(destination => {
    if (destination.enabled === false) {
      return false;
    }

    let enabledVariants: LlmModelVariant[] = variants.filter(
      variant => variant[destination.enabledKey]
    );

    return enabledVariants.length === 0;
  });

  let error = invalidDestination
    ? `${invalidDestination.label} requires at least one enabled variant.`
    : undefined;

  return error;
}
