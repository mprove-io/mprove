import { ConfigService } from '@nestjs/config';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { CallerEnum } from '#common/enums/special/caller.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FieldAny } from '#common/interfaces/blockml/internal/field-any';
import { Model } from '#common/interfaces/blockml/model';
import { ModelField } from '#common/interfaces/blockml/model-field';
import { MyRegex } from '#common/models/my-regex';
import { sdrType } from '#common/types/sdr-type';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { BmError } from '~blockml/models/bm-error';
import { log } from './log';

let func = FuncEnum.CheckSuggestModelDimension;

export function checkSuggestModelDimension<T extends sdrType>(
  item: {
    entities: T[];
    apiModels: Model[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

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
          y.fieldClass === FieldClassEnum.Dimension &&
          y.result === FieldResultEnum.String
      )
      .forEach(field => {
        if (isUndefined(field.suggestModelDimension)) {
          field.suggestModelDimension = `${apiModel.modelId}.${field.id}`;
        }
      });
  });

  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  log(cs, caller, func, structId, LogTypeEnum.Entities, newEntities);

  return newEntities;
}

function checkSuggestFields(item: {
  fields: FieldAny[];
  isPushErrors: boolean;
  apiModels: Model[];
  errors: BmError[];
  fileName: string;
  filePath: string;
}) {
  let { fields, isPushErrors, fileName, filePath, apiModels } = item;

  fields.forEach(field => {
    if (
      field.fieldClass !== FieldClassEnum.Filter &&
      field.fieldClass !== FieldClassEnum.Dimension
    ) {
      return;
    }

    if (isDefined(field.suggest_model_dimension)) {
      if (isUndefined(field.result !== FieldResultEnum.String)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.SUGGEST_MODEL_DIMENSION_WITH_WRONG_RESULT,
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

      let reg = MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(field.suggest_model_dimension);

      if (isUndefined(r)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.WRONG_SUGGEST_MODEL_DIMENSION,
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

      if (isUndefined(apiModel)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_MODEL,
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

      if (isUndefined(apiModelField)) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                ErTitleEnum.SUGGEST_MODEL_DIMENSION_REFS_NOT_VALID_MODEL_FIELD,
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

      if (apiModelField.fieldClass !== FieldClassEnum.Dimension) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                ErTitleEnum.SUGGEST_MODEL_DIMENSION_DOES_NOT_REF_TO_A_DIMENSION,
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

      if (apiModelField.result !== FieldResultEnum.String) {
        if (isPushErrors === true) {
          item.errors.push(
            new BmError({
              title:
                ErTitleEnum.SUGGEST_MODEL_DIMENSION_REF_RESULT_IS_NOT_A_STRING,
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
  fields: ModelField[];
  apiModels: Model[];
  errors: BmError[];
  fileName: string;
  filePath: string;
}) {
  let { fields, apiModels } = item;

  fields.forEach(field => {
    if (
      field.fieldClass !== FieldClassEnum.Filter &&
      field.fieldClass !== FieldClassEnum.Dimension
    ) {
      return;
    }

    if (isDefined(field.suggestModelDimension)) {
      if (isUndefined(field.result !== FieldResultEnum.String)) {
        field.suggestModelDimension = undefined;
        return;
      }

      let reg = MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(field.suggestModelDimension);

      if (isUndefined(r)) {
        field.suggestModelDimension = undefined;
        return;
      }

      let modelId = r[1];
      let fieldId = r[2];

      let apiModel = apiModels.find(m => m.modelId === modelId);

      if (isUndefined(apiModel)) {
        field.suggestModelDimension = undefined;
        return;
      }

      let apiModelField = apiModel.fields.find(mField => mField.id === fieldId);

      if (isUndefined(apiModelField)) {
        field.suggestModelDimension = undefined;
        return;
      }

      if (apiModelField.fieldClass !== FieldClassEnum.Dimension) {
        field.suggestModelDimension = undefined;
        return;
      }

      if (apiModelField.result !== FieldResultEnum.String) {
        field.suggestModelDimension = undefined;
        return;
      }
    }
  });
}
