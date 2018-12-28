import * as fs from 'fs';
import * as y from 'js-yaml';
import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

const { forEach } = require('p-iteration');

export async function yamlToObjects(item: {
  file3s: interfaces.File3[];
  dir: string;
}): Promise<any[]> {
  let filesAny: any[] = [];

  await forEach(item.file3s, async (x: interfaces.File3) => {
    let tiedFileArray: string[] = [];

    // try YAML parsing
    let breakOnYamlParsing: boolean;
    try {
      y.safeLoad(x.content);
    } catch (e) {
      // error e4
      ErrorsCollector.addError(
        new AmError({
          title: `file content is not YAML`,
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

    let processedString: string = '';

    tiedFileArray.forEach((s: string, index) => {
      // remove comments

      let sReg = ApRegex.COMMENTS_G();
      s = s.replace(sReg, '');

      let reg = ApRegex.CAPTURE_PARAMETER_AND_VALUE();
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
      // error e278
      ErrorsCollector.addError(
        new AmError({
          title: `processed content is not YAML`,
          message: `please contact support`,
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
      // error e5
      ErrorsCollector.addError(
        new AmError({
          title: 'Top level is not Dictionary',
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

  return filesAny;
}
