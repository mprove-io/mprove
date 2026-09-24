import { BmError } from '#blockml/classes/bm-error';
import { MyRegex } from '#common/classes/my-regex';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { FieldAny } from '#common/zod/blockml/internal/field-any';
import type { Model } from '#common/zod/blockml/model';

export function checkSuggestFields(item: {
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
