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
    apiModels: common.Model[];
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
      isPushErrors: true,
      apiModels: item.apiModels,
      errors: item.errors,
      fileName: x.fileName,
      filePath: x.filePath
    });

    newEntities.push(x);
  });

  item.apiModels.forEach(apiModel => {
    // TODO: create separate validation for stores and mods before creating apiModels
    checkSuggestApiFields({
      fields: apiModel.fields,
      apiModels: item.apiModels,
      errors: item.errors,
      fileName: apiModel.modelId,
      filePath: apiModel.filePath
    });

    apiModel.fields
      .filter(
        y =>
          y.fieldClass === common.FieldClassEnum.Dimension &&
          y.result === common.FieldResultEnum.String
      )
      .forEach(field => {
        if (common.isUndefined(field.suggestModelDimension)) {
          field.suggestModelDimension = `${apiModel.modelId}.${field.id}`;
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
  apiModels: common.Model[];
  errors: BmError[];
  fileName: string;
  filePath: string;
}) {
  let { fields, isPushErrors, fileName, filePath, apiModels } = item;

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

      let modelId = r[1];
      let fieldId = r[2];

      let apiModel = apiModels.find(m => m.modelId === modelId);

      if (common.isUndefined(apiModel)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum.SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_MODEL,
              message: `model "${modelId}" is missing or not valid`,
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

      let apiModelField = apiModel.fields.find(mField => mField.id === fieldId);

      if (common.isUndefined(apiModelField)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_MODEL_FIELD,
              message: `found "${field.suggest_model_dimension}" references missing or not valid field "${fieldId}"`,
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

      if (apiModelField.fieldClass !== common.FieldClassEnum.Dimension) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .SUGGEST_MODEL_DIMENSION_DOES_NOT_REF_TO_A_DIMENSION,
              message: `found "${field.suggest_model_dimension}" references ${apiModelField.fieldClass} "${fieldId}"`,
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

      if (apiModelField.result !== common.FieldResultEnum.String) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .SUGGEST_MODEL_DIMENSION_REF_RESULT_IS_NOT_A_STRING,
              message:
                `found "${field.suggest_model_dimension}" references ${apiModelField.fieldClass} ` +
                `"${fieldId}" with result "${apiModelField.result}"`,
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
  });
}

function checkSuggestApiFields(item: {
  fields: common.ModelField[];
  apiModels: common.Model[];
  errors: BmError[];
  fileName: string;
  filePath: string;
}) {
  let { fields, apiModels } = item;

  fields.forEach(field => {
    if (
      field.fieldClass !== common.FieldClassEnum.Filter &&
      field.fieldClass !== common.FieldClassEnum.Dimension
    ) {
      return;
    }

    if (common.isDefined(field.suggestModelDimension)) {
      if (common.isUndefined(field.result !== common.FieldResultEnum.String)) {
        field.suggestModelDimension = undefined;
        return;
      }

      let reg = common.MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(field.suggestModelDimension);

      if (common.isUndefined(r)) {
        field.suggestModelDimension = undefined;
        return;
      }

      let modelId = r[1];
      let fieldId = r[2];

      let apiModel = apiModels.find(m => m.modelId === modelId);

      if (common.isUndefined(apiModel)) {
        field.suggestModelDimension = undefined;
        return;
      }

      let apiModelField = apiModel.fields.find(mField => mField.id === fieldId);

      if (common.isUndefined(apiModelField)) {
        field.suggestModelDimension = undefined;
        return;
      }

      if (apiModelField.fieldClass !== common.FieldClassEnum.Dimension) {
        field.suggestModelDimension = undefined;
        return;
      }

      if (apiModelField.result !== common.FieldResultEnum.String) {
        field.suggestModelDimension = undefined;
        return;
      }
    }
  });
}
