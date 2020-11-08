import * as y from 'js-yaml';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';

import { forEachSeries } from 'p-iteration';
import { BmError } from '../bm-error';

let logPack = '1-yaml';
let logFolder = '4-yaml-to-objects';

export async function yamlToObjects(item: {
  file3s: interfaces.File3[];
  errors: BmError[];
  structId: string;
}): Promise<any[]> {
  let logId = item.structId;
  helper.log(logId, logPack, logFolder, enums.LogEnum.In, item);

  let filesAny: any[] = [];

  await forEachSeries(item.file3s, async (x: interfaces.File3) => {
    let tiedFileArray: string[] = [];

    // try YAML parsing
    let breakOnYamlParsing: boolean;
    try {
      y.safeLoad(x.content);
    } catch (e) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.FILE_CONTENT_IS_NOT_YAML,
          message: `${e.message}`,
          lines: [
            {
              line: 0,
              name: x.name,
              path: x.path
            }
          ]
        })
      );
      breakOnYamlParsing = true;
    }
    if (breakOnYamlParsing) {
      return;
    }

    // prepare line numbers
    tiedFileArray = x.content.split('\n');

    let processedString = '';

    tiedFileArray.forEach((s: string, index) => {
      // remove comments

      let sReg = api.MyRegex.COMMENTS_G();
      s = s.replace(sReg, '');

      let reg = api.MyRegex.CAPTURE_PARAMETER_AND_VALUE();
      let r = reg.exec(s);

      let num: number = index + 1;

      if (r) {
        processedString =
          processedString +
          r[1] +
          '_line_num___' +
          num +
          '___line_num_' +
          ':' +
          r[2] +
          '\n';
      } else {
        processedString = processedString + s + '\n';
      }
    });

    let parsedYaml;

    let breakOnProcessedYamlParsing: boolean;
    try {
      parsedYaml = y.safeLoad(processedString);
    } catch (e) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.PROCESSED_CONTENT_IS_NOT_YAML,
          message: 'please contact support',
          lines: [
            {
              line: 0,
              name: x.name,
              path: x.path
            }
          ]
        })
      );
      breakOnProcessedYamlParsing = true;
    }
    if (breakOnProcessedYamlParsing) {
      return;
    }

    if (!parsedYaml) {
      // empty file
      return;
    } else if (parsedYaml.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.TOP_LEVEL_IS_NOT_DICTIONARY,
          message: 'Top level of BlockML file must have key/value pairs',
          lines: [
            {
              line: 0,
              name: x.name,
              path: x.path
            }
          ]
        })
      );

      return;
    }

    parsedYaml.name = x.name;
    parsedYaml.path = x.path;
    parsedYaml.ext = x.ext;

    filesAny.push(parsedYaml);
  });

  helper.log(logId, logPack, logFolder, enums.LogEnum.OutFilesAny, filesAny);
  helper.log(logId, logPack, logFolder, enums.LogEnum.OutErrors, item.errors);

  return filesAny;
}
