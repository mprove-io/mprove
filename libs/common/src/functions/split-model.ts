export function splitModel(
  model: string | undefined
): { providerID: string; modelID: string } | undefined {
  if (!model) {
    return undefined;
  }

  let i = model.indexOf('/');

  if (i > 0) {
    return {
      providerID: model.substring(0, i),
      modelID: model.substring(i + 1)
    };
  }

  return undefined;
}
