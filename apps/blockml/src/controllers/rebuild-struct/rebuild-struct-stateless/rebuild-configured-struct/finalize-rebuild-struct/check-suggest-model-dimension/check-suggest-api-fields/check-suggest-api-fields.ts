import type { BmError } from '#blockml/classes/bm-error/bm-error';
import { MyRegex } from '#common/classes/my-regex/my-regex';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';

export function checkSuggestApiFields(item: {
  fields: ModelField[];
  apiModels: Model[];
  errors: BmError[];
  fileName: string;
  filePath: string;
}) {
  let { fields, apiModels } = item;

  fields.forEach(field => {
    if (field.fieldClass !== 'filter' && field.fieldClass !== 'dimension') {
      return;
    }

    if (isDefined(field.suggestModelDimension)) {
      if (isUndefined(field.result !== 'string')) {
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

      if (apiModelField.fieldClass !== 'dimension') {
        field.suggestModelDimension = undefined;
        return;
      }

      if (apiModelField.result !== 'string') {
        field.suggestModelDimension = undefined;
        return;
      }
    }
  });
}
