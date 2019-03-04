import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkDashboardFiltersFromField(item: {
  dashboards: interfaces.Dashboard[],
  models: interfaces.Model[]
}) {

  item.dashboards.forEach(x => {

    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {

      if (field.result === enums.FieldExtResultEnum.FromField) {

        if (typeof field.from_field === 'undefined' || field.from_field === null) {
          // error e74
          ErrorsCollector.addError(new AmError({
            title: `missing from_field`,
            message: `parameter "from_field: model.alias.field" must be ` +
              `set for filters with "result: from_field"`,
            lines: [{
              line: field.name_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }

        let reg = ApRegex.CAPTURE_TRIPLE_REF_WITHOUT_BRACKETS_G();
        let r = reg.exec(field.from_field);

        if (r) {

          let modelName = r[1];
          let asName = r[2];
          let fName = r[3];

          let model = item.models.find(m => m.name === modelName);

          if (!model) {
            // error e77
            ErrorsCollector.addError(new AmError({
              title: `missing model`,
              message: `model "${modelName}" is missing or not valid`,
              lines: [{
                line: field.from_field_line_num,
                name: x.file,
                path: x.path,
              }],
            }));
            return;
          }

          if (asName === 'mf') {
            let modelField = model.fields.find(mField => mField.name === fName);

            if (!modelField) {
              // error e78
              ErrorsCollector.addError(new AmError({
                title: `missing model field`,
                message: `field "${fName}" is missing or not valid in fields section of "${modelName}" model`,
                lines: [{
                  line: field.from_field_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              return;

            } else {
              // ok get result from model field
              field.result = modelField.result;
            }

          } else {

            let join = model.joins.find(j => j.as === asName);

            if (!join) {
              // error e79
              ErrorsCollector.addError(new AmError({
                title: `missing alias`,
                message: `alias "${asName}" is missing in joins section of "${modelName}" model`,
                lines: [{
                  line: field.from_field_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              return;
            }

            let viewField = join.view.fields.find(vField => vField.name === fName);

            if (!viewField) {
              // error e80
              ErrorsCollector.addError(new AmError({
                title: `missing view field`,
                message: `field "${fName}" is missing or not valid in fields section of "${join.view.name}" view ` +
                  `with "${asName}" alias in "${modelName}" model`,
                lines: [{
                  line: field.from_field_line_num,
                  name: x.file,
                  path: x.path,
                }],
              }));
              return;

            } else {
              // ok get result from view field
              field.result = viewField.result;
            }
          }
        } else {
          // error e75
          ErrorsCollector.addError(new AmError({
            title: `wrong from_field`,
            message: `'from_field:' value must be specified in a form of "model.alias.field"`,
            lines: [{
              line: field.from_field_line_num,
              name: x.file,
              path: x.path,
            }],
          }));
          return;
        }
      }

      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.dashboards;
}