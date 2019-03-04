import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkFieldsDeps
  <T extends (interfaces.View | interfaces.Model)>(item: {
    entities: Array<T>
  }): Array<T> {

  item.entities.forEach(x => {

    let restart = true;

    while (restart) {

      restart = false;

      let newFields: interfaces.FieldExt[] = [];

      x.fields.forEach(field => {

        let nextField = false;

        Object.keys(x.fields_deps[field.name]).forEach(depName => {

          if (nextField) { return; }

          let dependentField = x.fields.find(f => f.name === depName);

          if (typeof dependentField === 'undefined' || dependentField === null) {
            // error e29
            ErrorsCollector.addError(new AmError({
              title: `reference to not valid field`,
              message: `field "${depName}" is missing or not valid`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;

          } else if (dependentField.name === field.name) {
            // error e28
            ErrorsCollector.addError(new AmError({
              title: `field self reference`,
              message: `field can not reference to itself`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;

          } else if (dependentField.field_class === enums.FieldClassEnum.Filter) {
            // error e239
            ErrorsCollector.addError(new AmError({
              title: `field refs filter`,
              message: `Filters can not be referenced through $. ` +
                `Found field "${field.name}" is referencing filter "${depName}".`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;

          } else if (field.field_class === enums.FieldClassEnum.Dimension &&
            dependentField.field_class === enums.FieldClassEnum.Measure) {
            // error e30
            ErrorsCollector.addError(new AmError({
              title: `dimension refs measure`,
              message: `Dimensions can not reference measures. ` +
                `Found dimension "${field.name}" is referencing measure "${depName}".`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;

          } else if (field.field_class === enums.FieldClassEnum.Dimension &&
            dependentField.field_class === enums.FieldClassEnum.Calculation) {
            // error e31
            ErrorsCollector.addError(new AmError({
              title: `dimension refs calculation`,
              message: `Dimensions can not reference calculations. ` +
                `Found dimension "${field.name}" is referencing calculation "${depName}".`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;

          } else if (field.field_class === enums.FieldClassEnum.Measure &&
            dependentField.field_class === enums.FieldClassEnum.Measure) {
            // error e32
            ErrorsCollector.addError(new AmError({
              title: `measure refs measure`,
              message: `Measures can not reference measures. ` +
                `Found measure "${field.name}" is referencing measure "${depName}".`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;

          } else if (field.field_class === enums.FieldClassEnum.Measure &&
            dependentField.field_class === enums.FieldClassEnum.Calculation) {
            // error e33
            ErrorsCollector.addError(new AmError({
              title: `measure refs calculation`,
              message: `Measures can not reference calculations. ` +
                `Found measure "${field.name}" is referencing calculation "${depName}".`,
              lines: [{
                line: x.fields_deps[field.name][depName],
                name: x.file,
                path: x.path,
              }],
            }));
            nextField = true;
            restart = true;
            delete x.fields_deps[field.name];
            return;
          }
        });

        if (nextField) { return; }

        newFields.push(field);
      });

      x.fields = newFields;
    }

  });

  return item.entities;
}
