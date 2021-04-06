import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';
let Graph = require('tarjan-graph');

let func = enums.FuncEnum.CheckCycles;

export function checkCycles<T extends types.vmType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): T[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    let g = new Graph();
    Object.keys(x.fieldsDeps).forEach(fieldName => {
      Object.keys(x.fieldsDeps[fieldName]).forEach(depName => {
        g.add(fieldName, [depName]);
      });
    });

    if (g.hasCycle()) {
      let lines: interfaces.BmErrorLine[] = [];

      let cycles: any[] = g.getCycles();
      // api.logToConsole(cycles);

      let cycledNames = cycles[0].map((c: any) => c.name);

      cycledNames.forEach((cName: string) => {
        if (x.fieldsDeps[cName]) {
          Object.keys(x.fieldsDeps[cName]).forEach(dName => {
            if (cycledNames.indexOf(dName) > -1) {
              lines.push({
                line: x.fieldsDeps[cName][dName],
                name: x.fileName,
                path: x.filePath
              });
            }
          });
        }
      });

      let cycledNamesString: string = cycledNames.join('", "');
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.CYCLE_IN_REFERENCES,
          message: `fields "${cycledNamesString}" references each other by cycle`,
          lines: lines
        })
      );
      return;
    }

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(
    cs,
    caller,
    func,
    structId,
    enums.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}
