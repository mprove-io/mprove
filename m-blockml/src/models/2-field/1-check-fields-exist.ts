import { interfaces } from '../../barrels/interfaces';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { api } from 'src/barrels/api';
import { LogTypeEnum } from 'src/enums/_index';

let func = enums.FuncEnum.CheckFieldsExist;

type t1 = interfaces.View | interfaces.Model | interfaces.Dashboard;

export function checkFieldsExist<T extends t1>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    if (!x.fields) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.MISSING_FIELDS,
          message: `parameter "${enums.ParameterEnum.Fields}" is required for ${x.fileExt} file`,
          lines: [
            {
              line: 0,
              name: x.fileName,
              path: x.filePath
            }
          ]
        })
      );
      return;
    }
    newEntities.push(x);
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);
  // if (newEntities.length > 0) {
  //   let logName: enums.LogEnum;

  //   switch (newEntities[0].fileExt) {
  //     case api.FileExtensionEnum.View: {
  //       logName = enums.LogEnum.Views;
  //       break;
  //     }
  //     case api.FileExtensionEnum.Model: {
  //       logName = enums.LogEnum.Models;
  //       break;
  //     }
  //     case api.FileExtensionEnum.Dashboard:
  //       logName = enums.LogEnum.Dashboards;
  //       break;
  //   }
  //   helper.log(caller, func, structId, logName, newEntities);
  // }

  return newEntities;
}
