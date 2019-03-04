import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkAlwaysJoin(item: {
  models: interfaces.Model[]
}) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    x.always_join_list = {};

    if (typeof x.always_join === 'undefined' || x.always_join === null) {
      newModels.push(x);
      return;
    }

    let joinList = x.always_join.split(',');

    joinList.forEach(asPart => {

      if (nextModel) { return; }

      let reg = ApRegex.CAPTURE_WORD_BETWEEN_WHITESPACES();
      let r;

      if (r = reg.exec(asPart)) {

        let asName = r[1];

        let join = x.joins.find(j => j.as === asName);

        if (!join) {
          // error e142
          ErrorsCollector.addError(new AmError({
            title: `missing Join`,
            message: `parameter "always_join:" references Join "${asName}" that is missing or not valid`,
            lines: [{
              line: x.always_join_line_num,
              name: x.file,
              path: x.path,
            }]
          }));
          nextModel = true;
          return;
        }

        // ok
        x.always_join_list[asName] = 1;

      } else {
        // error e143
        ErrorsCollector.addError(new AmError({
          title: `wrong always_join`,
          message: `parameter "always_join:" must have one or more Join aliases separated by comma. ` +
            `Found unparseable string "${asPart}".`,
          lines: [{
            line: x.always_join_line_num,
            name: x.file,
            path: x.path,
          }]
        }));
        nextModel = true;
        return;
      }
    });

    if (nextModel) { return; }

    newModels.push(x);
  });

  return newModels;
}
