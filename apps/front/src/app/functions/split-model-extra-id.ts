export function splitModelExtraId(
  modelExtraId: string | undefined
): { providerID: string; modelID: string } | undefined {
  if (!modelExtraId) {
    return undefined;
  }

  let i = modelExtraId.indexOf('/');

  if (i > 0) {
    return {
      providerID: modelExtraId.substring(0, i),
      modelID: modelExtraId.substring(i + 1)
    };
  }

  return undefined;
}
