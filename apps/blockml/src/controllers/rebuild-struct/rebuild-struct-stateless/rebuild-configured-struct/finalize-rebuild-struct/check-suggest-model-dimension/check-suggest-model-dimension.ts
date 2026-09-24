import type { ConfigService } from '@nestjs/config';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { log } from '#blockml/functions/log/log';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import type { CallerEnum } from '#common/enums/special/caller.enum';
import { FuncEnum } from '#common/enums/special/func.enum';
import { LogTypeEnum } from '#common/enums/special/log-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { sdrType } from '#common/types/sdr-type';
import type { Model } from '#common/zod/blockml/model';
import { checkSuggestApiFields } from './check-suggest-api-fields/check-suggest-api-fields';
import { checkSuggestFields } from './check-suggest-fields/check-suggest-fields';

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
