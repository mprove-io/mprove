import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkCharsInRefs(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    if (
      typeof x.sql_always_where_calc === 'undefined' ||
      x.sql_always_where_calc === null
    ) {
      newModels.push(x);
      return;
    }

    // collect single references
    let reg = ApRegex.CAPTURE_REFS_G();
    let r;
    let captures: string[] = [];

    while ((r = reg.exec(x.sql_always_where_calc))) {
      captures.push(r[1]);
    }

    let wrongChars: string[] = [];

    // check chars in captures
    captures.forEach(cap => {
      let reg2 = ApRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
      let r2;

      while ((r2 = reg2.exec(cap))) {
        wrongChars.push(r2[1]);
      }
    });

    let wrongCharsString: string = '';

    wrongCharsString = [...new Set(wrongChars)].join(', '); // unique

    if (wrongChars.length > 0) {
      // error e152
      ErrorsCollector.addError(
        new AmError({
          title: `wrong chars in sql_always_where_calc refs`,
          message: `characters "${wrongCharsString}" can not be used inside \$\{\} of model`,
          lines: [
            {
              line: x.sql_always_where_calc_line_num,
              name: x.file,
              path: x.path
            }
          ]
        })
      );
      return;
    }

    newModels.push(x);
  });

  return newModels;
}
