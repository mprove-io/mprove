import * as fs from 'fs';
import * as y from 'js-yaml';
import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

const { forEach } = require('p-iteration');

export async function yamlToObjects(item: {
  file3s: interfaces.File3[],
  dir: string
}): Promise<any[]> {

  let filesAny: any[] = [];

  // item.file3s.forEach(x => {
  await forEach(item.file3s, async (x: interfaces.File3) => {

    // recreating absolute path
    let rpReg = ApRegex.TRIPLE_UNDERSCORE_G();

    let relativePath: string = x.path.replace(rpReg, '/');
    let absolutePath: string = item.dir + '/' + relativePath;

    let tiedFileString: string = '';
    let tiedFileArray: string[] = [];

    // file open
    let breakOnFileOpen: boolean;
    try {
      tiedFileString = fs.readFileSync(absolutePath, 'UTF-8');
      // throw new Error('abc');
    } catch (e) {
      // TODO: error e3 test
      ErrorsCollector.addError(new AmError({
        title: `can't open file`,
        message: `unable to open file ${x.name}`,
        lines: [{
          line: 0,
          name: x.name,
          path: x.path,
        }],
      }));
      breakOnFileOpen = true;
    }
    if (breakOnFileOpen) { return; }

    // try YAML parsing
    let breakOnYamlParsing: boolean;
    try {
      y.safeLoad(tiedFileString);
    } catch (e) {
      // error e4
      ErrorsCollector.addError(new AmError({
        title: `file content is not YAML`,
        message: `${e.message}`,
        lines: [{
          line: 0,
          name: x.name,
          path: x.path,
        }],
      }));
      breakOnYamlParsing = true;
    }
    if (breakOnYamlParsing) { return; }

    // prepare line numbers
    tiedFileArray = tiedFileString.split('\n');

    let processedString: string = '';

    tiedFileArray.forEach((s: string, index) => {

      // remove comments

      let sReg = ApRegex.COMMENTS_G();
      s = s.replace(sReg, '');

      let reg = ApRegex.CAPTURE_PARAMETER_AND_VALUE();
      let r = reg.exec(s);

      let num: number = index + 1;

      if (r) {
        processedString = processedString + r[1] + '_line_num___' + num +
          '___line_num_' + ':' + r[2] + '\n';
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
      ErrorsCollector.addError(new AmError({
        title: `processed content is not YAML`,
        message: `please contact support`,
        lines: [{
          line: 0,
          name: x.name,
          path: x.path,
        }],
      }));
      breakOnProcessedYamlParsing = true;
    }
    if (breakOnProcessedYamlParsing) { return; }

    if (!parsedYaml) {
      // empty file
      return;

    } else if (parsedYaml.constructor !== Object) {
      // error e5
      ErrorsCollector.addError(new AmError({
        title: 'Top level is not Dictionary',
        message: 'Top level of BlockML file must have key/value pairs',
        lines: [{
          line: 0,
          name: x.name,
          path: x.path,
        }]
      }));

      return;
    }

    parsedYaml.name = x.name;
    parsedYaml.path = x.path;
    parsedYaml.ext = x.ext;

    filesAny.push(parsedYaml);
  });

  return filesAny;
}
