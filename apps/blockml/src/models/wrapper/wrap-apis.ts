import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapApis(item: { structId: string; apis: interfaces.Api[] }) {
  let { structId, apis } = item;

  let apiApis: common.Api[] = apis.map(x => {
    let api: common.Api = {
      structId: structId,
      apiId: x.name,
      filePath: x.filePath,
      label: x.label,
      steps: x.steps,
      serverTs: 1
    };
    return api;
  });

  return apiApis;
}
