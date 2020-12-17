import * as fse from 'fs-extra';
import { enums } from '../barrels/enums';

export function log(
  caller: enums.CallerEnum,
  func: enums.FuncEnum,
  structId: string,
  logType: enums.LogTypeEnum,
  content: any
) {
  if (process.env.MPROVE_BLOCKML_LOG_IO !== 'TRUE') {
    return;
  }

  let funcArray = func.toString().split('/');

  // let pack = funcArray[0];
  let f = funcArray[1];

  // if (Array.isArray(content)) {
  //   content.map(contentRecord => orderKeys(contentRecord));
  // } else {
  //   Object.keys(content).forEach(k => {
  //     let contentItem = content[k];

  //     if (Array.isArray(contentItem)) {
  //       contentItem.map(record => orderKeys(record));
  //     }
  //   });
  // }

  let str = JSON.stringify(content, null, 2);

  let logTypeString = logType.toString();

  let dir = `src/logs/${caller}/${f}/${structId}`;
  let path = `${dir}/${logTypeString}`;

  fse.ensureDirSync(dir);
  fse.writeFileSync(path, str);
}

// https://stackoverflow.com/questions/9658690/is-there-a-way-to-sort-order-keys-in-javascript-objects
/**
 * Returns and modifies the input object so that its keys are
 * returned in sorted order
 */
function orderKeys(obj) {
  const newObj = obj;
  const keys = Object.keys(newObj).sort();

  const after = {};
  keys.forEach(key => {
    after[key] = newObj[key];
    delete newObj[key];
  });

  keys.forEach(key => {
    newObj[key] = after[key];
  });

  return newObj;
}
