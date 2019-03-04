import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkAliases(item: { models: interfaces.Model[] }) {

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {

    let nextModel: boolean = false;

    let aliases: { as: string, as_line_nums: number[] }[] = [];

    x.joins.forEach(j => {

      if (nextModel) { return; }

      if (typeof j.as === 'undefined' || j.as === null) {

        let lineNums: number[] = [];
        Object.keys(j)
          .filter(p => p.match(ApRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push((<any>j)[l]));

        // error e16
        ErrorsCollector.addError(new AmError({
          title: `missing 'as'`,
          message: `parameter 'as' required for each element of joins list`,
          lines: [
            {
              line: Math.min(...lineNums),
              name: x.file,
              path: x.path,
            }
          ],
        }));
        nextModel = true;
        return;

      } else {

        let index = aliases.findIndex(alias => alias.as === j.as);

        if (index > -1) {
          aliases[index].as_line_nums.push(j.as_line_num);
        } else {
          aliases.push({ as: j.as, as_line_nums: [j.as_line_num] });
        }

        if (typeof j.from_view !== 'undefined' && j.from_view !== null) {

          x.from_as = j.as;
        }
      }

    });

    if (nextModel) { return; }

    // joins processed

    let nextM: boolean = false;

    aliases.forEach(alias => {

      if (nextM) { return; }

      if (alias.as_line_nums.length > 1) {
        // error e17
        ErrorsCollector.addError(new AmError({
          title: `duplicate aliases`,
          message: `'as' value must be unique across joins elements`,
          lines: alias.as_line_nums.map(l => ({
            line: l,
            name: x.file,
            path: x.path,
          }))
        }));
        nextM = true;
        return;
      }
    });

    if (nextM) { return; }

    newModels.push(x);
  });

  return newModels;
}
