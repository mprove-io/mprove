import { helper } from '~/barrels/helper';
import { enums } from '~/barrels/enums';
import { api } from '~/barrels/api';
import { BmError } from '~/models/bm-error';
import { interfaces } from '~/barrels/interfaces';
import { ConfigService } from '@nestjs/config';

let func = enums.FuncEnum.CheckFieldsDoubleDeps;

export function checkFieldsDoubleDeps(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    Object.keys(x.fieldsDoubleDeps).forEach(fieldName => {
      Object.keys(x.fieldsDoubleDeps[fieldName]).forEach(as => {
        let join = x.joins.find(j => j.as === as);

        if (helper.isUndefined(join)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.MODEL_FIELD_WRONG_ALIAS_IN_REFERENCE,
              message:
                `found referencing on alias "${as}" that is missing in joins elements. ` +
                `Check "${enums.ParameterEnum.As}:" values.`,
              lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(d => ({
                line: x.fieldsDoubleDeps[fieldName][as][d],
                name: x.fileName,
                path: x.filePath
              }))
            })
          );
          return;
        }

        Object.keys(x.fieldsDoubleDeps[fieldName][as]).forEach(depName => {
          let field = x.fields.find(f => f.name === fieldName);
          let depField = join.view.fields.find(f => f.name === depName);

          if (helper.isUndefined(depField)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MODEL_FIELD_REFS_NOT_VALID_FIELD,
                message: `Found reference to field "${depName}" of view "${join.view.name}" as "${as}"`,
                lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(
                  d => ({
                    line: x.fieldsDoubleDeps[fieldName][as][d],
                    name: x.fileName,
                    path: x.filePath
                  })
                )
              })
            );
            return;
          }

          if (depField.fieldClass === api.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MODEL_FIELD_REFS_FILTER,
                message: `Found reference to filter "${depName}" of view "${join.view.name}" as "${as}"`,
                lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(
                  d => ({
                    line: x.fieldsDoubleDeps[fieldName][as][d],
                    name: x.fileName,
                    path: x.filePath
                  })
                )
              })
            );
            return;
          }

          if (
            field.fieldClass === api.FieldClassEnum.Dimension &&
            depField.fieldClass === api.FieldClassEnum.Measure
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MODEL_DIMENSION_REFS_MEASURE,
                message:
                  'Dimensions can not reference measures. ' +
                  `Found dimension "${fieldName}" is referencing measure "${depName}" ` +
                  `of view "${join.view.name}" as "${as}".`,
                lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(
                  d => ({
                    line: x.fieldsDoubleDeps[fieldName][as][d],
                    name: x.fileName,
                    path: x.filePath
                  })
                )
              })
            );
            return;
          }

          if (
            field.fieldClass === api.FieldClassEnum.Dimension &&
            depField.fieldClass === api.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MODEL_DIMENSION_REFS_CALCULATION,
                message:
                  'Dimensions can not reference calculations. ' +
                  `Found dimension "${fieldName}" is referencing calculation "${depName}" ` +
                  `of view "${join.view.name}" as "${as}".`,
                lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(
                  d => ({
                    line: x.fieldsDoubleDeps[fieldName][as][d],
                    name: x.fileName,
                    path: x.filePath
                  })
                )
              })
            );
            return;
          }

          if (
            field.fieldClass === api.FieldClassEnum.Measure &&
            depField.fieldClass === api.FieldClassEnum.Measure
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MODEL_MEASURE_REFS_MEASURE,
                message:
                  'Measures can not reference measures. ' +
                  `Found measure "${fieldName}" is referencing measure "${depName}" ` +
                  `of view "${join.view.name}" as "${as}".`,
                lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(
                  d => ({
                    line: x.fieldsDoubleDeps[fieldName][as][d],
                    name: x.fileName,
                    path: x.filePath
                  })
                )
              })
            );
            return;
          }

          if (
            field.fieldClass === api.FieldClassEnum.Measure &&
            depField.fieldClass === api.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.MODEL_MEASURE_REFS_CALCULATION,
                message:
                  'Measures can not reference calculations. ' +
                  `Found measure "${fieldName}" is referencing calculation "${depName}" ` +
                  `of view "${join.view.name}" as "${as}".`,
                lines: Object.keys(x.fieldsDoubleDeps[fieldName][as]).map(
                  d => ({
                    line: x.fieldsDoubleDeps[fieldName][as][d],
                    name: x.fileName,
                    path: x.filePath
                  })
                )
              })
            );
            return;
          }
        });
      });
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
