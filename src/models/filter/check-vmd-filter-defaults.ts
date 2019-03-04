import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { api } from '../../barrels/api';
import { barProcessFilter } from '../../barrels/bar-process-filter';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkVMDFilterDefaults<
  T extends interfaces.View | interfaces.Model | interfaces.Dashboard
>(item: { entities: Array<T>; weekStart: api.ProjectWeekStartEnum }) {
  item.entities.forEach(x => {
    x.filters = {};

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      if (field.field_class !== enums.FieldClassEnum.Filter) {
        newFields.push(field);
        return;
      }

      if (typeof field.default !== 'undefined' && field.default !== null) {
        if (!Array.isArray(field.default)) {
          // error e104, e235, e236
          ErrorsCollector.addError(
            new AmError({
              title: `default is not a List`,
              message: `"default:" must be a List with element(s) inside like:
- 'filter expression'
- 'filter expression'`,
              lines: [
                {
                  line: field.default_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }

        field.fractions = [];

        let p = barProcessFilter.processFilter({
          result: field.result,
          filter_bricks: field.default,
          proc: 'proc',
          weekStart: item.weekStart,
          timezone: 'UTC',
          sqlTimestampSelect: 'sql_timestamp_select',
          ORs: [],
          NOTs: [],
          IN: [],
          NOTIN: [],
          fractions: field.fractions
        });

        if (p.valid === 0) {
          // error e105, 237, 238
          ErrorsCollector.addError(
            new AmError({
              title: `wrong filter expression`,
              message: `found expression "${p.brick}" for result "${
                field.result
              }" of filter "${field.name}"`,
              lines: [
                {
                  line: field.default_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }

        x.filters[field.name] = JSON.parse(JSON.stringify(field.default));
      } else {
        x.filters[field.name] = [];
      }

      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.entities;
}
