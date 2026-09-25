import type { BmError } from '#blockml/classes/bm-error/bm-error';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Model } from '#common/zod/blockml/model';
import type { ModelField } from '#common/zod/blockml/model-field';

export function checkSuggestApiFields(item: {
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
