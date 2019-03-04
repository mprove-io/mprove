import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function checkJoinsFromView(item: { models: interfaces.Model[] }) {
  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let froms: number[] = [];

    let nextModel: boolean = false;

    x.joins.forEach(j => {
      if (nextModel) {
        return;
      }

      if (
        typeof j.from_view !== 'undefined' &&
        j.from_view !== null &&
        typeof j.join_view !== 'undefined' &&
        j.join_view !== null
      ) {
        // error e12
        ErrorsCollector.addError(
          new AmError({
            title: `from_view and join_view`,
            message: `one Join can not contain both 'from_view' and 'join_view' parameters at the same time`,
            lines: [
              {
                line: j.from_view_line_num,
                name: x.file,
                path: x.path
              },
              {
                line: j.join_view_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        nextModel = true;
        return;
      } else if (
        !(typeof j.from_view !== 'undefined' && j.from_view !== null) &&
        !(typeof j.join_view !== 'undefined' && j.join_view !== null)
      ) {
        let lineNums: number[] = [];
        Object.keys(j)
          .filter(p => p.match(ApRegex.ENDS_WITH_LINE_NUM()))
          .forEach(l => lineNums.push((<any>j)[l]));

        // error e13
        ErrorsCollector.addError(
          new AmError({
            title: `missing from_view or join_view`,
            message: `join element must contain 'from_view' or 'join_view' parameters`,
            lines: [
              {
                line: Math.min(...lineNums),
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        nextModel = true;
        return;
      } else if (typeof j.from_view !== 'undefined' && j.from_view !== null) {
        froms.push(j.from_view_line_num);
      }
    });

    if (nextModel) {
      return;
    }

    // joins processed

    if (froms.length === 0) {
      // error e14
      ErrorsCollector.addError(
        new AmError({
          title: `missing from_view element`,
          message: `model must have exactly one Join with 'from_view' parameter`,
          lines: [
            {
              line: x.joins_line_num,
              name: x.file,
              path: x.path
            }
          ]
        })
      );
      return; // no need for nextModel check
    } else if (froms.length > 1) {
      // error e15
      ErrorsCollector.addError(
        new AmError({
          title: `too many from_view`,
          message: `model must have only one Join with 'from_view' parameter`,
          lines: froms.map(fl => ({
            line: fl,
            name: x.file,
            path: x.path
          }))
        })
      );
      return; // no need for nextModel check
    }

    newModels.push(x);
  });

  return newModels;
}
