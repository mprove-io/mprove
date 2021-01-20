import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { ConfigService } from '@nestjs/config';
let Graph = require('tarjan-graph');
let toposort = require('toposort');

let func = enums.FuncEnum.CheckJoinsCyclesAndToposort;

export function checkJoinsCyclesAndToposort(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

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
        let cycledNames: string[] = cycle.map(c => c.name);

        let lines: interfaces.BmErrorLine[] = [];

        cycledNames.forEach(cName => {
          let cycledJoin = x.joins.find(j => j.as === cName);

          lines.push({
            line: cycledJoin.sql_on_line_num,
            name: x.fileName,
            path: x.filePath
          });

          if (helper.isDefined(cycledJoin.sql_where_line_num)) {
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
            title: enums.ErTitleEnum.CYCLE_IN_JOINS_SQL_ON_OR_SQL_WHERE,
            message: `Joins "${cycledNamesString}" references each other by cycle.`,
            lines: lines
          })
        );
        return;
      });
    } else {
      // not cyclic - toposort
      let graph = [];
      let zeroDepsJoins = [];

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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
