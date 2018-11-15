import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkModelFiltersFromField(item: {
  models: interfaces.Model[];
}) {
  item.models.forEach(x => {
    x.fields.forEach(field => {
      if (field.result === enums.FieldExtResultEnum.FromField) {
        if (
          typeof field.from_field === 'undefined' ||
          field.from_field === null
        ) {
          // error e227
          ErrorsCollector.addError(
            new AmError({
              title: `missing from_field in model filter`,
              message: `parameter 'from_field:' must be set for filters with 'result: from_field`,
              lines: [
                {
                  line: field.name_line_num,
                  name: x.file,
                  path: x.path
                }
              ]
            })
          );

          let fieldIndex = x.fields.findIndex(f => f.name === field.name);
          x.fields = [
            ...x.fields.slice(0, fieldIndex),
            ...x.fields.slice(fieldIndex + 1)
          ];

          delete x.fields_deps[field.name];
          delete x.fields_deps_after_singles[field.name];
          delete x.fields_double_deps[field.name];
          delete x.fields_double_deps_after_singles[field.name];
          return;
        }

        if (field.from_field.match(ApRegex.WORD_CHARACTERS())) {
          let fromField = x.fields.find(f => f.name === field.from_field);

          if (!fromField) {
            // error e228
            ErrorsCollector.addError(
              new AmError({
                title: `missing model field`,
                message: `field "${
                  field.from_field
                }" is missing or not valid in fields section of "${
                  x.name
                }" model`,
                lines: [
                  {
                    line: field.from_field_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            let fieldIndex = x.fields.findIndex(f => f.name === field.name);
            x.fields = [
              ...x.fields.slice(0, fieldIndex),
              ...x.fields.slice(fieldIndex + 1)
            ];

            delete x.fields_deps[field.name];
            delete x.fields_deps_after_singles[field.name];
            delete x.fields_double_deps[field.name];
            delete x.fields_double_deps_after_singles[field.name];
            return;
          }

          // also auto check for self reference
          if (fromField.field_class === enums.FieldClassEnum.Filter) {
            // error e229
            ErrorsCollector.addError(
              new AmError({
                title: `from_field references filter`,
                message: `model filter's "from_field:" can not reference filter`,
                lines: [
                  {
                    line: field.from_field_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            let fieldIndex = x.fields.findIndex(f => f.name === field.name);
            x.fields = [
              ...x.fields.slice(0, fieldIndex),
              ...x.fields.slice(fieldIndex + 1)
            ];

            delete x.fields_deps[field.name];
            delete x.fields_deps_after_singles[field.name];
            delete x.fields_double_deps[field.name];
            delete x.fields_double_deps_after_singles[field.name];
            return;
          }

          // ok get result from model field
          field.result = fromField.result;
        } else {
          let reg = ApRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G();
          let r = reg.exec(field.from_field);

          if (r) {
            let asName = r[1];
            let viewFieldName = r[2];

            switch (true) {
              case asName === 'mf': {
                // error e230
                ErrorsCollector.addError(
                  new AmError({
                    title: `unexpected 'mf' alias in model from_field`,
                    message: `use "from_field: field_name" to reference current model field`,
                    lines: [
                      {
                        line: field.from_field_line_num,
                        name: x.file,
                        path: x.path
                      }
                    ]
                  })
                );

                let fieldIndex = x.fields.findIndex(f => f.name === field.name);
                x.fields = [
                  ...x.fields.slice(0, fieldIndex),
                  ...x.fields.slice(fieldIndex + 1)
                ];

                delete x.fields_deps[field.name];
                delete x.fields_deps_after_singles[field.name];
                delete x.fields_double_deps[field.name];
                delete x.fields_double_deps_after_singles[field.name];
                return;
                // break;
              }

              case asName !== 'mf': {
                let join = x.joins.find(j => j.as === asName);

                if (!join) {
                  // error e231
                  ErrorsCollector.addError(
                    new AmError({
                      title: `missing alias`,
                      message: `alias "${asName}" is missing in joins section of "${
                        x.name
                      }" model`,
                      lines: [
                        {
                          line: field.from_field_line_num,
                          name: x.file,
                          path: x.path
                        }
                      ]
                    })
                  );

                  let fieldIndex = x.fields.findIndex(
                    f => f.name === field.name
                  );
                  x.fields = [
                    ...x.fields.slice(0, fieldIndex),
                    ...x.fields.slice(fieldIndex + 1)
                  ];

                  delete x.fields_deps[field.name];
                  delete x.fields_deps_after_singles[field.name];
                  delete x.fields_double_deps[field.name];
                  delete x.fields_double_deps_after_singles[field.name];
                  return;
                } else {
                  let viewField = join.view.fields.find(
                    vf => vf.name === viewFieldName
                  );

                  if (!viewField) {
                    // error e232
                    ErrorsCollector.addError(
                      new AmError({
                        title: `missing view field`,
                        message:
                          `field '${viewFieldName}' is missing or not valid in fields section` +
                          ` of '${
                            join.view.name
                          }' view with "${asName}" alias in "${x.name}" model`,
                        lines: [
                          {
                            line: field.from_field_line_num,
                            name: x.file,
                            path: x.path
                          }
                        ]
                      })
                    );

                    let fieldIndex = x.fields.findIndex(
                      f => f.name === field.name
                    );
                    x.fields = [
                      ...x.fields.slice(0, fieldIndex),
                      ...x.fields.slice(fieldIndex + 1)
                    ];

                    delete x.fields_deps[field.name];
                    delete x.fields_deps_after_singles[field.name];
                    delete x.fields_double_deps[field.name];
                    delete x.fields_double_deps_after_singles[field.name];
                    return;
                  }

                  // also auto check for self reference
                  if (viewField.field_class === enums.FieldClassEnum.Filter) {
                    // error e233
                    ErrorsCollector.addError(
                      new AmError({
                        title: `from_field references filter`,
                        message: `model filter's "from_field:" can not reference filter`,
                        lines: [
                          {
                            line: field.from_field_line_num,
                            name: x.file,
                            path: x.path
                          }
                        ]
                      })
                    );

                    let fieldIndex = x.fields.findIndex(
                      f => f.name === field.name
                    );
                    x.fields = [
                      ...x.fields.slice(0, fieldIndex),
                      ...x.fields.slice(fieldIndex + 1)
                    ];

                    delete x.fields_deps[field.name];
                    delete x.fields_deps_after_singles[field.name];
                    delete x.fields_double_deps[field.name];
                    delete x.fields_double_deps_after_singles[field.name];
                    return;
                  }
                  field.result = viewField.result;
                }
                break;
              }
            }
          } else {
            // error e234
            ErrorsCollector.addError(
              new AmError({
                title: `wrong from_field in model filter`,
                message:
                  `model filter "from_field:" value must be specified in ` +
                  `a form of "join_alias.view_field_name" or "model_field_name"`,
                lines: [
                  {
                    line: field.from_field_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );

            let fieldIndex = x.fields.findIndex(f => f.name === field.name);
            x.fields = [
              ...x.fields.slice(0, fieldIndex),
              ...x.fields.slice(fieldIndex + 1)
            ];

            delete x.fields_deps[field.name];
            delete x.fields_deps_after_singles[field.name];
            delete x.fields_double_deps[field.name];
            delete x.fields_double_deps_after_singles[field.name];
            return;
          }
        }
      }
    });
  });

  return item.models;
}
