import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function afterDoubleCheckFieldsDeps(item: {
  models: interfaces.Model[];
}) {
  item.models.forEach(x => {
    let restart: boolean = true;

    while (restart) {
      restart = false;

      Object.keys(x.fields_deps).forEach(fieldName => {
        if (restart) {
          return;
        }

        Object.keys(x.fields_deps[fieldName]).forEach(depName => {
          if (restart) {
            return;
          }

          let depField = x.fields.find(f => f.name === depName);

          if (!depField) {
            // error e50
            ErrorsCollector.addError(
              new AmError({
                title: `reference to not valid field`,
                message: `field "${depName}" is missing or not valid`,
                lines: [
                  {
                    line: x.fields_deps[fieldName][depName],
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            let fieldIndex = x.fields.findIndex(f => f.name === fieldName);
            x.fields = [
              ...x.fields.slice(0, fieldIndex),
              ...x.fields.slice(fieldIndex + 1)
            ];

            delete x.fields_deps[fieldName];
            delete x.fields_deps_after_singles[fieldName];
            delete x.fields_double_deps[fieldName];

            restart = true;
            return;
          }
        });
      });
    }
  });

  return item.models;
}
