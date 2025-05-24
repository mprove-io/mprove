import { common } from '~backend/barrels/common';

export function makeModelFileText(item: {
  isStore: boolean;
  modelId: string;
  label: string;
  connectionId: string;
  roles: string;
}) {
  let { isStore, modelId, label, connectionId, roles } = item;

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
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined
  });

  let modelFileText = common.toYaml(next);

  return modelFileText;
}
