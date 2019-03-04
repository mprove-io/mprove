import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkFieldsDoubleDeps(item: {
  models: interfaces.Model[]
}) {

  item.models.forEach(x => {

    Object.keys(x.fields_double_deps).forEach(fieldName => {

      let nextField: boolean = false;

      Object.keys(x.fields_double_deps[fieldName]).forEach(as => {

        if (nextField) { return; }

        let join = x.joins.find(j => j.as === as);

        if (!join) {

          // error e44
          ErrorsCollector.addError(new AmError({
            title: `wrong alias in reference`,
            message: `found referencing on alias "${as}" that is missing in joins elements. ` +
              `Check "as:" values.`,
            lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
              line: x.fields_double_deps[fieldName][as][d],
              name: x.file,
              path: x.path,
            }))
          }));

          let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
          x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];
          delete x.fields_deps[fieldName];
          delete x.fields_deps_after_singles[fieldName];
          delete x.fields_double_deps[fieldName];
          nextField = true;
          return;
        }

        Object.keys(x.fields_double_deps[fieldName][as]).forEach(depName => {

          if (nextField) { return; }

          let field = x.fields.find(f => f.name === fieldName);
          let depField = join.view.fields.find(f => f.name === depName);

          if (!depField) {
            // error e45
            ErrorsCollector.addError(new AmError({
              title: `reference to not valid field`,
              message: `found referencing to field "${depName}" ` +
                `of view "${join.view.name}" as "${as}"`,
              lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
                line: x.fields_double_deps[fieldName][as][d],
                name: x.file,
                path: x.path,
              }))
            }));

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            nextField = true;
            return;

          } else if (depField.field_class === enums.FieldClassEnum.Filter) {
            // error e240
            ErrorsCollector.addError(new AmError({
              title: `field references filter`,
              message: `Filters can not be referenced through \$. ` +
                `Found field "${fieldName}" is referencing filter "${depName}" ` +
                `of view "${join.view.name}" as "${as}".`,
              lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
                line: x.fields_double_deps[fieldName][as][d],
                name: x.file,
                path: x.path,
              }))
            }));

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            nextField = true;
            return;

          } else if (field.field_class === enums.FieldClassEnum.Dimension
            && depField.field_class === enums.FieldClassEnum.Measure) {

            // error e46
            ErrorsCollector.addError(new AmError({
              title: `dimension refs measure`,
              message: `Dimensions can not reference measures. ` +
                `Found dimension "${fieldName}" is referencing measure "${depName}" ` +
                `of view "${join.view.name}" as "${as}".`,
              lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
                line: x.fields_double_deps[fieldName][as][d],
                name: x.file,
                path: x.path,
              }))
            }));

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            nextField = true;
            return;

          } else if (field.field_class === enums.FieldClassEnum.Dimension
            && depField.field_class === enums.FieldClassEnum.Calculation) {

            // error e47
            ErrorsCollector.addError(new AmError({
              title: `dimension refs calculation`,
              message: `Dimensions can not reference calculations. ` +
                `Found dimension "${fieldName}" is referencing calculation "${depName}" ` +
                `of view "${join.view.name}" as "${as}".`,
              lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
                line: x.fields_double_deps[fieldName][as][d],
                name: x.file,
                path: x.path,
              }))
            }));

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            nextField = true;
            return;

          } else if (field.field_class === enums.FieldClassEnum.Measure
            && depField.field_class === enums.FieldClassEnum.Measure) {

            // error e48
            ErrorsCollector.addError(new AmError({
              title: `measure refs measure`,
              message: `Measures can not reference measures. ` +
                `Found measure "${fieldName}" is referencing measure "${depName}" ` +
                `of view "${join.view.name}" as "${as}".`,
              lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
                line: x.fields_double_deps[fieldName][as][d],
                name: x.file,
                path: x.path,
              }))
            }));

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            nextField = true;
            return;

          } else if (field.field_class === enums.FieldClassEnum.Measure
            && depField.field_class === enums.FieldClassEnum.Calculation) {

            // error e49
            ErrorsCollector.addError(new AmError({
              title: `measure refs calculation`,
              message: `Measures can not reference calculations. ` +
                `Found measure "${fieldName}" is referencing calculation "${depName}" ` +
                `of view "${join.view.name}" as "${as}".`,
              lines: Object.keys(x.fields_double_deps[fieldName][as]).map(d => ({
                line: x.fields_double_deps[fieldName][as][d],
                name: x.file,
                path: x.path,
              }))
            }));

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [...x.fields.slice(0, fieldIndex), ...x.fields.slice(fieldIndex + 1)];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            nextField = true;
            return;
          }
        });
      });
    });
  });

  return item.models;
}
