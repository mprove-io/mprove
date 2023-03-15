import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';
let Graph = require('tarjan-graph');
let toposort = require('toposort');

let func = common.FuncEnum.CheckJoinsCyclesAndToposort;

export function checkJoinsCyclesAndToposort(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    // check for cycles - tarjan
    let g = new Graph();

    Object.keys(x.joinsDoubleDepsAfterSingles).forEach(alias => {
      Object.keys(x.joinsDoubleDepsAfterSingles[alias]).forEach(as => {
        if (alias !== as) {
          g.add(alias, [as]);
        }
      });
    });

    if (g.hasCycle()) {
      let cycles: any[] = g.getCycles();

      cycles.forEach(cycle => {
        let cycledNames: string[] = cycle.map((c: any) => c.name);

        let lines: common.FileErrorLine[] = [];

        cycledNames.forEach(cName => {
          let cycledJoin = x.joins.find(j => j.as === cName);

          lines.push({
            line: cycledJoin.sql_on_line_num,
            name: x.fileName,
            path: x.filePath
          });

          if (common.isDefined(cycledJoin.sql_where_line_num)) {
            lines.push({
              line: cycledJoin.sql_where_line_num,
              name: x.fileName,
              path: x.filePath
            });
          }
        });

        let cycledNamesString: string = cycledNames.join('", "');
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.CYCLE_IN_JOINS_SQL_ON_OR_SQL_WHERE,
            message: `Joins "${cycledNamesString}" references each other by cycle.`,
            lines: lines
          })
        );
        return;
      });
    } else {
      // not cyclic - toposort
      let graph: string[][] = [];
      let zeroDepsJoins: string[] = [];

      Object.keys(x.joinsDoubleDepsAfterSingles).forEach(alias => {
        Object.keys(x.joinsDoubleDepsAfterSingles[alias]).forEach(as => {
          if (alias !== as) {
            graph.push([alias, as]);
          }
        });
      });

      let sorted = toposort(graph).reverse();

      Object.keys(x.joinsDoubleDepsAfterSingles).forEach(alias => {
        if (sorted.indexOf(alias) < 0) {
          zeroDepsJoins.push(alias);
        }
      });

      let joinsSorted = [...zeroDepsJoins, ...sorted];

      if (joinsSorted.indexOf(x.fromAs) < 0) {
        joinsSorted = [x.fromAs, ...joinsSorted];
      }

      x.joinsSorted = joinsSorted;
    }

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
