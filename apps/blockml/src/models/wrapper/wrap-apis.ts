import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapApis(item: { apis: interfaces.Api[] }) {
  let { apis } = item;

  let apiApis: common.Api[] = apis.map(x => {
    let rep: common.Api = {
      apiId: x.name,
      filePath: x.filePath,
      label: x.label,
      https: helper.toBooleanFromLowercaseString(x.https),
      host: x.host,
      headers: x.headers,
      steps: x.steps
    };
    return rep;
  });

  return apiApis;
}
