import { interfaces } from 'src/barrels/interfaces';
import { api } from '../../../barrels/api';

export function getAsDeps(input: string) {
  let asDeps: interfaces.View['asDeps'] = {};

  let reg = api.MyRegex.CAPTURE_VIEW_REF_G();
  let r;

  while ((r = reg.exec(input))) {
    let view: string = r[1];
    let alias: string = r[2];

    if (!asDeps[alias]) {
      asDeps[alias] = { viewName: view, fieldNames: {} };
    }
  }

  let reg2 = api.MyRegex.CAPTURE_DOUBLE_REF_G();
  let r2;

  while ((r2 = reg2.exec(input))) {
    let as: string = r2[1];
    let dep: string = r2[2];

    asDeps[as].fieldNames[dep] = 1;
  }

  return asDeps;
}
