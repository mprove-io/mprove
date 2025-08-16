import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckVmdrSuggestModelDimension;

export function checkVmdrSuggestModelDimension<T extends types.vsmdrType>(
  item: {
    entities: T[];
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    checkSuggestFields({
      fields: x.fields,
      isPushErrors: (x as common.FileModel).isViewModel === true ? false : true,
      models: item.models,
      errors: item.errors,
      fileName: x.fileName,
      filePath: x.filePath
    });

    newEntities.push(x);
  });

  item.models.forEach(model => {
    model.joins.forEach(join =>
      checkSuggestFields({
        fields: join.view.fields,
        isPushErrors: false,
        models: item.models,
        errors: item.errors,
        fileName: join.view.fileName,
        filePath: join.view.filePath
      })
    );

    model.joins.forEach(join =>
      join.view.fields
        .filter(
          y =>
            y.fieldClass === common.FieldClassEnum.Dimension &&
            y.result === common.FieldResultEnum.String
        )
        .forEach(field => {
          if (common.isUndefined(field.suggest_model_dimension)) {
            field.suggest_model_dimension = `${model.name}.${join.as}.${field.name}`;
          }
        })
    );

    model.fields
      .filter(
        y =>
          y.fieldClass === common.FieldClassEnum.Dimension &&
          y.result === common.FieldResultEnum.String
      )
      .forEach(field => {
        if (common.isUndefined(field.suggest_model_dimension)) {
          field.suggest_model_dimension = `${model.name}.${common.MF}.${field.name}`;
        }
      });
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}

function checkSuggestFields(item: {
  fields: common.FieldAny[];
  isPushErrors: boolean;
  models: common.FileModel[];
  errors: BmError[];
  fileName: string;
  filePath: string;
}) {
  let { fields, isPushErrors, fileName, filePath } = item;

  fields.forEach(field => {
    if (
      field.fieldClass !== common.FieldClassEnum.Filter &&
      field.fieldClass !== common.FieldClassEnum.Dimension
    ) {
      return;
    }

    if (common.isDefined(field.suggest_model_dimension)) {
      if (common.isUndefined(field.result !== common.FieldResultEnum.String)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum.SUGGEST_MODEL_DIMENSION_WITH_WRONG_RESULT,
              message: `suggest_model_dimension only works with result "string"`,
              lines: [
                {
                  line: field.suggest_model_dimension_line_num,
                  name: fileName,
                  path: filePath
                }
              ]
            })
          );
        }
        field.suggest_model_dimension = undefined;
        return;
      }

      let reg = common.MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(field.suggest_model_dimension);

      if (common.isUndefined(r)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.WRONG_SUGGEST_MODEL_DIMENSION,
              message:
                `The value of the "suggest_model_dimension" parameter must be a reference structured as "model_name.field_path". ` +
                `Found value "${field.suggest_model_dimension}"`,
              lines: [
                {
                  line: field.suggest_model_dimension_line_num,
                  name: fileName,
                  path: filePath
                }
              ]
            })
          );
        }
        field.suggest_model_dimension = undefined;
        return;
      }

      let modelName = r[1];
      let asName = r[2];
      let fieldName = r[3];

      let model = item.models.find(m => m.name === modelName);

      if (common.isUndefined(model)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum.SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_MODEL,
              message: `model "${modelName}" is missing or not valid`,
              lines: [
                {
                  line: field.suggest_model_dimension_line_num,
                  name: fileName,
                  path: filePath
                }
              ]
            })
          );
        }
        field.suggest_model_dimension = undefined;
        return;
      }

      if (asName === common.MF) {
        let modelField = model.fields.find(mField => mField.name === fieldName);

        if (common.isUndefined(modelField)) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_MODEL_FIELD,
                message:
                  `found "${field.suggest_model_dimension}" references missing or not valid field ` +
                  `"${fieldName}" of model "${model.name}" fields section`,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }

        if (modelField.fieldClass !== common.FieldClassEnum.Dimension) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_DOES_NOT_REF_TO_A_DIMENSION,
                message:
                  `found "${field.suggest_model_dimension}" references ${modelField.fieldClass} ` +
                  `"${fieldName}" of model "${model.name}" fields section`,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }

        if (modelField.result !== common.FieldResultEnum.String) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_REF_RESULT_IS_NOT_A_STRING,
                message:
                  `found "${field.suggest_model_dimension}" references ${modelField.fieldClass} ` +
                  `"${fieldName}" with result "${modelField.result}" of model "${model.name}" fields section`,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }
      } else {
        let join = model.joins.find(j => j.as === asName);

        if (common.isUndefined(join)) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_JOIN_ALIAS,
                message:
                  `found "${field.suggest_model_dimension}" references missing alias ` +
                  `"${asName}" of model "${model.name}" joins section `,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }

        let viewField = join.view.fields.find(f => f.name === fieldName);

        if (common.isUndefined(viewField)) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_JOIN_VIEW_FIELD,
                message:
                  `found "${field.suggest_model_dimension}" references missing or not valid field ` +
                  `"${fieldName}" of view "${join.view.name}" fields section. ` +
                  `View has "${asName}" alias in "${model.name}" model.`,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }

        if (viewField.fieldClass !== common.FieldClassEnum.Dimension) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_DOES_NOT_REF_TO_A_DIMENSION,
                message:
                  `found "${field.suggest_model_dimension}" references ${viewField.fieldClass} ` +
                  `"${fieldName}" of view "${join.view.name}" fields section. ` +
                  `View has "${asName}" alias in "${model.name}" model.`,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }

        if (viewField.result !== common.FieldResultEnum.String) {
          if (isPushErrors === true) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .SUGGEST_MODEL_DIMENSION_REF_RESULT_IS_NOT_A_STRING,
                message:
                  `found "${field.suggest_model_dimension}" references ${viewField.fieldClass} ` +
                  `"${fieldName}" with result "${viewField.result}" of view "${join.view.name}" fields section. ` +
                  `View has "${asName}" alias in "${model.name}" model.`,
                lines: [
                  {
                    line: field.suggest_model_dimension_line_num,
                    name: fileName,
                    path: filePath
                  }
                ]
              })
            );
          }
          field.suggest_model_dimension = undefined;
          return;
        }
      }
    }
  });
}
