import type { ConfigService } from '@nestjs/config';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Caller } from '#common/types/blockml/diagnostics/caller';
import type { Func } from '#common/types/blockml/diagnostics/func';
import type { sdrType } from '#common/types/blockml/parts/internal/sdr-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import { checkSuggestApiFields } from './check-suggest-api-fields/check-suggest-api-fields';
import { checkSuggestFields } from './check-suggest-fields/check-suggest-fields';

let func: Func = 'extra/check-suggest-model-dimension';

export function checkSuggestModelDimension<T extends sdrType>(
  item: {
    entities: T[];
    apiModels: Model[];
    errors: BmError[];
    structId: string;
    caller: Caller;
  },
  cs: ConfigService<BlockmlConfig>
) {
  let { caller, structId } = item;
  log(cs, caller, func, structId, 'input.log', item);

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
      .filter(y => y.fieldClass === 'dimension' && y.result === 'string')
      .forEach(field => {
        if (isUndefined(field.suggestModelDimension)) {
          field.suggestModelDimension = `${apiModel.modelId}.${field.id}`;
        }
      });
  });

  log(cs, caller, func, structId, 'out_errors.log', item.errors);

  log(cs, caller, func, structId, 'out_entities.log', newEntities);

  return newEntities;
}
