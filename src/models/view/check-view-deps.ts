import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkViewDeps(item: {
  views: interfaces.View[]
}) {

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {

    let viewError = false;

    if (Object.keys(x.as_deps).length > 0) {

      Object.keys(x.as_deps).forEach(as => {

        let referencedViewName = x.as_deps[as].view_name;

        let referencedView = item.views.find(v => v.name === referencedViewName);

        if (!referencedView) {

          // error e283
          ErrorsCollector.addError(new AmError({
            title: `derived_table references missing view`,
            message: `derived_table contains reference to missing view "${referencedViewName}"`,
            lines: [{
              line: x.derived_table_line_num,
              name: x.file,
              path: x.path,
            }],
          }));

          viewError = true;
          return;
        }

        if (typeof referencedView.derived_table !== 'undefined' && referencedView.derived_table !== null) {
          let input = referencedView.derived_table;

          let reg = ApRegex.CAPTURE_START_FIELD_TARGET_END();
          let r = reg.exec(input);

          if (r) {

            // error e284
            ErrorsCollector.addError(new AmError({
              title: `referenced view uses apply_filter`,
              message: `derived_table can not reference views that use apply_filter.` +
                `Found referencing view "${referencedViewName}"`,
              lines: [{
                line: x.derived_table_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            viewError = true;
            return;
          }
        }


        Object.keys(x.as_deps[as].fields).forEach(fieldName => {
          let field = referencedView.fields.find(f => f.name === fieldName);

          if (!field) {
            // error e286
            ErrorsCollector.addError(new AmError({
              title: `derived_table references missing field`,
              message: `Found referencing field "${fieldName}" of view "${referencedView.name}"`,
              lines: [{
                line: x.derived_table_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            viewError = true;
            return;

          } else if (field.field_class === enums.FieldClassEnum.Filter) {
            // error e287
            ErrorsCollector.addError(new AmError({
              title: `derived_table references Filter`,
              message: `Found referencing Filter "${fieldName}" of view "${referencedView.name}".` +
                `Derived_table can not reference Filter fields`,
              lines: [{
                line: x.derived_table_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            viewError = true;
            return;
          }
        });


      });
    }

    if (viewError) {
      return;
    }

    newViews.push(x);
  });

  if (newViews.length < item.views.length) {
    newViews = this.checkViewDeps({ views: newViews });
  }

  return newViews;
}
