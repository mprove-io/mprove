export function makeModelFileText(item: {
  isStore: boolean;
  modelId: string;
  label: string;
  connectionId: string;
  presetId: string;
  roles: string;
}) {
  let { isStore, modelId, label, connectionId, presetId, roles } = item;

  let base: any = {};

  if (isStore === true) {
    base.store = modelId;
  } else {
    base.model = modelId;
  }

  let next = Object.assign(base, {
    label: label,
    connection: connectionId,
    access_roles:
      isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    preset: presetId
  });

  let modelFileText = toYaml(next);

  return modelFileText;
}
