import { common } from '~blockml/barrels/common';

export function wrapApis(item: { structId: string; apis: common.FileApi[] }) {
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
