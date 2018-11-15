import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkDerivedTableApplyFilter(item: {
  views: interfaces.View[];
}) {
  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    if (typeof x.derived_table !== 'undefined' && x.derived_table !== null) {
      let input = x.derived_table;

      if (x.permanent.match(ApRegex.TRUE())) {
        let reg = ApRegex.CAPTURE_START_FIELD_TARGET_END();
        let r = reg.exec(input);

        if (r) {
          // error e249
          ErrorsCollector.addError(
            new AmError({
              title: `permanent derived_table can not use apply_filter`,
              message: `found '\{% apply_filter ${
                r[2]
              } %\}' in permanent derived_table`,
              lines: [
                {
                  line: x.derived_table_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );
          return;
        }
      }

      if (x.permanent.match(ApRegex.FALSE())) {
        let reg2 = ApRegex.CAPTURE_START_FIELD_TARGET_END();
        let r2;

        while ((r2 = reg2.exec(input))) {
          let start = r2[1];
          let fieldName = r2[2];
          let target = r2[3];
          let end = r2[4];

          let field = x.fields.find(f => f.name === fieldName);

          if (!field) {
            // error e250
            ErrorsCollector.addError(
              new AmError({
                title: `apply_filter references missing filter`,
                message: `filter '${fieldName}' is missing or not valid`,
                lines: [
                  {
                    line: x.derived_table_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            return;
          } else if (field.field_class !== enums.FieldClassEnum.Filter) {
            // error e251
            ErrorsCollector.addError(
              new AmError({
                title: `apply_filter references field that is not a filter`,
                message:
                  `apply_filter must reference filter. ` +
                  `Found field '${fieldName}' that is ${field.field_class}`,
                lines: [
                  {
                    line: x.derived_table_line_num,
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
      }
    }
    newViews.push(x);
  });
  return newViews;
}
