import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { enums } from '../../barrels/enums';
import { types } from '../../barrels/types';
import { BmError } from '../bm-error';
import { processFilter } from './process-filter';

let func = enums.FuncEnum.CheckVMDFilterDefaults;

export function checkVMDFilterDefaults<T extends types.vmdType>(item: {
  entities: Array<T>;
  weekStart: api.ProjectWeekStartEnum;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.filters = {};

    x.fields.forEach(field => {
      if (field.fieldClass !== enums.FieldClassEnum.Filter) {
        return;
      }

      if (
        x.fileExt === api.FileExtensionEnum.Dashboard &&
        helper.isUndefined(field.default)
      ) {
        // TODO: add test DASHBOARD_FILTER_MUST_HAVE_DEFAULT
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.DASHBOARD_FILTER_MUST_HAVE_DEFAULT,
            message: `${api.FileExtensionEnum.Dashboard} ${enums.FieldClassEnum.Filter} must have "${enums.ParameterEnum.Default}" parameter`,
            lines: [
              {
                line: field.name_line_num,
                name: x.fileName,
                path: x.filePath
              }
            ]
          })
        );
        return;
      }

      if (helper.isUndefined(field.default)) {
        x.filters[field.name] = [];
      } else {
        field.fractions = [];
        // TODO: check constants
        let p = processFilter({
          weekStart: item.weekStart,
          connection: x.connection,
          timezone: 'UTC',
          result: field.result,
          filterBricks: field.default,
          proc: 'proc',
          sqlTimestampSelect: 'sql_timestamp_select',
          ORs: [],
          NOTs: [],
          IN: [],
          NOTIN: [],
          fractions: field.fractions
        });

        if (p.valid === 0) {
          // error e105, 237, 238
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_FILTER_EXPRESSION,
              message: `found expression "${p.brick}" for result "${field.result}" of filter "${field.name}"`,
              lines: [
                {
                  line: field.default_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        x.filters[field.name] = JSON.parse(JSON.stringify(field.default));
      }
    });

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
