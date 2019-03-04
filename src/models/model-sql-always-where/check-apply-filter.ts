import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkApplyFilter(item: { models: interfaces.Model[] }) {
  item.models.forEach(x => {
    if (
      typeof x.sql_always_where === 'undefined' ||
      x.sql_always_where === null
    ) {
      return;
    }

    let input = x.sql_always_where;

    let reg = ApRegex.CAPTURE_START_FIELD_TARGET_END();
    let r;

    while ((r = reg.exec(input))) {
      let start = r[1];
      let fieldName = r[2];
      let target = r[3];
      let end = r[4];

      let field = x.fields.find(f => f.name === fieldName);

      if (!field) {
        // error e254
        ErrorsCollector.addError(
          new AmError({
            title: `sql_always_where apply_filter references missing filter`,
            message: `filter "${fieldName}" is missing or not valid`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      } else if (field.field_class !== enums.FieldClassEnum.Filter) {
        // error e255
        ErrorsCollector.addError(
          new AmError({
            title: `sql_always_where apply_filter references field that is not a filter`,
            message:
              `apply_filter must reference filter. ` +
              `Found field "${fieldName}" that is ${field.field_class}`,
            lines: [
              {
                line: x.sql_always_where_line_num,
                name: x.file,
                path: x.path
              }
            ]
          })
        );
        return;
      }
      input = start + end;
    }
  });

  return item.models;
}
