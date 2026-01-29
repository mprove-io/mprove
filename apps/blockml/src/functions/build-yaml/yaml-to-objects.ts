import { ConfigService } from '@nestjs/config';
import { load } from 'js-yaml';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { BmError } from '#blockml/models/bm-error';
import { LINE_NUM_END, LINE_NUM_START } from '#common/constants/top-blockml';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { File3 } from '#common/interfaces/blockml/internal/file-3';
import { MyRegex } from '#common/models/my-regex';
import { log } from '../extra/log';

let func = FuncEnum.YamlToObjects;

export function yamlToObjects(
  item: {
    file3s: File3[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
): any[] {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let filesAny: any[] = [];

  item.file3s.forEach((x: File3) => {
    if (x.content === '') {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.FILE_IS_EMPTY,
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
          title: ErTitleEnum.FILE_CONTENT_IS_NOT_YAML,
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

      let sReg = MyRegex.COMMENTS_G();
      s = s.replace(sReg, '\t');
      // s = s.replace(sReg, '');

      let reg = MyRegex.CAPTURE_PARAMETER_AND_VALUE();
      let r = reg.exec(s);

      let num: number = index + 1;

      if (r) {
        processedString =
          processedString +
          r[1] +
          LINE_NUM_START +
          num +
          LINE_NUM_END +
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
          title: ErTitleEnum.PROCESSED_CONTENT_IS_NOT_YAML,
          message: 'please, create an issue',
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

    if (isUndefined(parsedYaml)) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.PARSED_YAML_IS_EMPTY,
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
          title: ErTitleEnum.TOP_LEVEL_IS_NOT_DICTIONARY,
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

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, filesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return filesAny;
}
