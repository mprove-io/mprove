import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkCharsInSqlOnRefs(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let nextModel: boolean = false;

    x.joins
      .filter(j => j.as !== x.from_as)
      .forEach(join => {
        if (nextModel) {
          return;
        }

        // collect references
        let reg = ApRegex.CAPTURE_REFS_G();
        let r;
        let captures: string[] = [];

        while ((r = reg.exec(join.sql_on))) {
          captures.push(r[1]);
        }

        let joinWrongChars: string[] = [];

        // check chars in captures of sql_on
        captures.forEach(cap => {
          let reg2 = ApRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
          let r2;

          while ((r2 = reg2.exec(cap))) {
            joinWrongChars.push(r2[1]);
          }
        });

        let joinWrongCharsString: string = '';

        joinWrongCharsString = [...new Set(joinWrongChars)].join(', '); // unique

        if (joinWrongChars.length > 0) {
          // error e51
          ErrorsCollector.addError(
            new AmError({
              title: `wrong chars in sql_on refs`,
              message: `characters "${joinWrongCharsString}" can not be used inside \$\{\} of model`,
              lines: [
                {
                  line: join.sql_on_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );

          nextModel = true;
          return;
        }
      });

    if (nextModel) {
      return;
    }

    newModels.push(x);
  });

  return newModels;
}
