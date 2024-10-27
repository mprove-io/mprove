import { ConfigService } from '@nestjs/config';
import { load } from 'js-yaml';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.YamlToObjects;

export function yamlToObjects(
  item: {
    file3s: common.File3[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): any[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let filesAny: any[] = [];

  item.file3s.forEach((x: common.File3) => {
    if (x.content === '') {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FILE_IS_EMPTY,
          message: `file must not be empty`,
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

    let tiedFileArray: string[] = [];

    // try YAML parsing
    let breakOnYamlParsing: boolean;
    try {
      load(x.content);
    } catch (e: any) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.FILE_CONTENT_IS_NOT_YAML,
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
          title: common.ErTitleEnum.PROCESSED_CONTENT_IS_NOT_YAML,
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
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.PARSED_YAML_IS_EMPTY,
          message: `file content must be valid yaml`,
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
    } else if (parsedYaml.constructor !== Object) {
      item.errors.push(
        new BmError({
          title: common.ErTitleEnum.TOP_LEVEL_IS_NOT_DICTIONARY,
          message: 'Top level of the Mprove file must have key/value pairs',
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

  helper.log(cs, caller, func, structId, common.LogTypeEnum.FilesAny, filesAny);
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );

  return filesAny;
}
