import { AmError } from '../../barrels/am-error';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkAndSetImplicitResults<
  T extends interfaces.View | interfaces.Model | interfaces.Dashboard
>(item: { entities: Array<T> }): Array<T> {
  item.entities.forEach((x: T) => {
    let newFields: interfaces.FieldExt[] = [];

    x.fields.forEach(field => {
      if (typeof field.result === 'undefined' || field.result === null) {
        switch (field.field_class) {
          case enums.FieldClassEnum.Dimension: {
            if (field.type === enums.FieldExtTypeEnum.YesnoIsTrue) {
              field.result = enums.FieldExtResultEnum.Yesno;
              field.result_line_num = 0;
            } else {
              field.result = enums.FieldExtResultEnum.String;
              field.result_line_num = 0;
            }

            newFields.push(field);
            return;
          }

          case enums.FieldClassEnum.Measure: {
            if (field.type === enums.FieldExtTypeEnum.List) {
              field.result = enums.FieldExtResultEnum.String;
              field.result_line_num = 0;
            } else {
              field.result = enums.FieldExtResultEnum.Number;
              field.result_line_num = 0;
            }

            newFields.push(field);
            return;
          }

          case enums.FieldClassEnum.Calculation: {
            field.result = enums.FieldExtResultEnum.Number;
            field.result_line_num = 0;

            newFields.push(field);
            return;
          }

          case enums.FieldClassEnum.Filter: {
            // error e220
            ErrorsCollector.addError(
              new AmError({
                title: `missing filter result`,
                message: `parameter 'result' is required for filters`,
                lines: [
                  {
                    line: field.name_line_num,
                    name: x.file,
                    path: x.path
                  }
                ]
              })
            );
            return;
          }
        }
      } else {
        switch (field.field_class) {
          case enums.FieldClassEnum.Dimension: {
            if (
              [
                enums.FieldExtResultEnum.String,
                enums.FieldExtResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              // error e63
              ErrorsCollector.addError(
                new AmError({
                  title: `wrong dimension result`,
                  message: `"${
                    field.result
                  }" is not valid result for dimension`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.file,
                      path: x.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case enums.FieldClassEnum.Measure: {
            if (
              [
                enums.FieldExtResultEnum.String,
                enums.FieldExtResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              // error e64
              ErrorsCollector.addError(
                new AmError({
                  title: `wrong measure result`,
                  message: `"${field.result}" is not valid result for measure`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.file,
                      path: x.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case enums.FieldClassEnum.Calculation: {
            if (
              [
                enums.FieldExtResultEnum.String,
                enums.FieldExtResultEnum.Number
              ].indexOf(field.result) < 0
            ) {
              // error e65
              ErrorsCollector.addError(
                new AmError({
                  title: `wrong calculation result`,
                  message: `"${
                    field.result
                  }" is not valid result for calculation`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.file,
                      path: x.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }

          case enums.FieldClassEnum.Filter: {
            if (
              [
                enums.FieldExtResultEnum.String,
                enums.FieldExtResultEnum.Number,
                enums.FieldExtResultEnum.FromField
              ].indexOf(field.result) < 0
            ) {
              // error e221
              ErrorsCollector.addError(
                new AmError({
                  title: `wrong filter result`,
                  message: `"${field.result}" is not valid result for filter`,
                  lines: [
                    {
                      line: field.result_line_num,
                      name: x.file,
                      path: x.path
                    }
                  ]
                })
              );
              return;
            }
            break;
          }
          // no need to check Time result (unknown parameter)
        }
      }

      newFields.push(field);
    });

    x.fields = newFields;
  });

  return item.entities;
}
