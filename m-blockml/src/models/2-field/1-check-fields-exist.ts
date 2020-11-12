import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';

type T1 = interfaces.View | interfaces.Model | interfaces.Dashboard;

export function checkFieldsExist<T extends T1>(item: {
  entities: Array<T>;
  errors: BmError[];
}) {
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

  return newEntities;
}
