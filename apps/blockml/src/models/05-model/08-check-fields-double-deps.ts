import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckFieldsDoubleDeps;

export function checkFieldsDoubleDeps(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    Object.keys(x.fieldsDoubleDeps).forEach(fieldName => {
      Object.keys(x.fieldsDoubleDeps[fieldName]).forEach(as => {
        let join = x.joins.find(j => j.as === as);

        if (common.isUndefined(join)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.MODEL_FIELD_WRONG_ALIAS_IN_REFERENCE,
              message:
                `found referencing on alias "${as}" that is missing in joins elements. ` +
                `Check "${common.ParameterEnum.As}:" values.`,
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

          if (common.isUndefined(depField)) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MODEL_FIELD_REFS_NOT_VALID_FIELD,
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

          if (depField.fieldClass === common.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MODEL_FIELD_REFS_FILTER,
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
            field.fieldClass === common.FieldClassEnum.Dimension &&
            depField.fieldClass === common.FieldClassEnum.Measure
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MODEL_DIMENSION_REFS_MEASURE,
                message:
                  'Dimensions cannot reference measures. ' +
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
            field.fieldClass === common.FieldClassEnum.Dimension &&
            depField.fieldClass === common.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MODEL_DIMENSION_REFS_CALCULATION,
                message:
                  'Dimensions cannot reference calculations. ' +
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
            field.fieldClass === common.FieldClassEnum.Measure &&
            depField.fieldClass === common.FieldClassEnum.Measure
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MODEL_MEASURE_REFS_MEASURE,
                message:
                  'Measures cannot reference measures. ' +
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
            field.fieldClass === common.FieldClassEnum.Measure &&
            depField.fieldClass === common.FieldClassEnum.Calculation
          ) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.MODEL_MEASURE_REFS_CALCULATION,
                message:
                  'Measures cannot reference calculations. ' +
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

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
