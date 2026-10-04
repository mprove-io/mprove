import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { load } from 'js-yaml';
import { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { LINE_NUM_END, LINE_NUM_START } from '#common/constants/top-blockml';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { File3 } from '#common/types/blockml/parts/internal/file/file-3';

let func: Func = 'build-yaml/yaml-to-objects';

export function yamlToObjects(item: {
  file3s: File3[];
  errors: BmError[];
  structId: string;
  caller: Caller;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<any[], never> {
  let { caller, structId, cs } = item;
  log(cs, caller, func, structId, 'input.log', item);

  let filesAny: any[] = [];

  item.file3s.forEach((x: File3) => {
    if (x.content === '') {
      item.errors.push(
        new BmError({
          title: 'FILE_IS_EMPTY',
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
          title: 'FILE_CONTENT_IS_NOT_YAML',
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
          title: 'PROCESSED_CONTENT_IS_NOT_YAML',
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
          title: 'PARSED_YAML_IS_EMPTY',
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
          title: 'TOP_LEVEL_IS_NOT_DICTIONARY',
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

  log(cs, caller, func, structId, 'out_filesAny.log', filesAny);
  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  return Result.succeed(filesAny);
}
