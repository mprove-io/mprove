import { ConfigService } from '@nestjs/config';
import { load } from 'js-yaml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.YamlToObjects;

export function yamlToObjects(
  item: {
    file3s: interfaces.File3[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): any[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let filesAny: any[] = [];

  item.file3s.forEach((x: interfaces.File3) => {
    let tiedFileArray: string[] = [];

    // try YAML parsing
    let breakOnYamlParsing: boolean;
    try {
      load(x.content);
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

      let sReg = common.MyRegex.COMMENTS_G();
      s = s.replace(sReg, '\t');
      // s = s.replace(sReg, '');

      let reg = common.MyRegex.CAPTURE_PARAMETER_AND_VALUE();
      let r = reg.exec(s);

      let num: number = index + 1;

      if (r) {
        processedString =
          processedString +
          r[1] +
          constants.LINE_NUM_START +
          num +
          constants.LINE_NUM_END +
          ':' +
          r[2] +
          '\n';
      } else {
        processedString = processedString + s + '\n';
      }
    });

    let parsedYaml: any;

    let breakOnProcessedYamlParsing: boolean;
    try {
      parsedYaml = load(processedString);
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

    if (common.isUndefined(parsedYaml)) {
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.FilesAny, filesAny);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return filesAny;
}
