import { helper } from '../../barrels/helper';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { enums } from '../../barrels/enums';
import { types } from '../../barrels/types';
import { BmError } from '../bm-error';
import { processFilter } from './process-filter';

let func = enums.FuncEnum.CheckVMDFilterDefaults;

export function checkVMDFilterDefaults<T extends types.vmdType>(item: {
  entities: Array<T>;
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
            message:
              `${api.FileExtensionEnum.Dashboard} ${enums.FieldClassEnum.Filter} must ` +
              `have "${enums.ParameterEnum.Default}" parameter`,
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
        let cn: api.ProjectConnection = {
          name: 'cn',
          type: api.ConnectionTypeEnum.PostgreSQL
        };

        let p = processFilter({
          filterBricks: field.default,
          result: field.result,
          // parameters below do not affect validation
          weekStart: api.ProjectWeekStartEnum.Monday,
          timezone: constants.UTC,
          connection: cn,
          proc: 'proc',
          sqlTimestampSelect: 'sqlTimestampSelect',
          ORs: [],
          NOTs: [],
          IN: [],
          NOTIN: [],
          fractions: []
        });

        if (p.valid === 0) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.WRONG_FILTER_EXPRESSION,
              message:
                `found expression "${p.brick}" for result "${field.result}" of ` +
                `filter "${field.name}"`,
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

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}
