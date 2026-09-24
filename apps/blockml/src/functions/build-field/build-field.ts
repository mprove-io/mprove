import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkAndSetImplicitFormatNumber } from '#blockml/functions/build-field/check-and-set-implicit-format-number/check-and-set-implicit-format-number';
import { checkAndSetImplicitResult } from '#blockml/functions/build-field/check-and-set-implicit-result/check-and-set-implicit-result';
import { checkFieldDeclaration } from '#blockml/functions/build-field/check-field-declaration/check-field-declaration';
import { checkFieldIsObject } from '#blockml/functions/build-field/check-field-is-object/check-field-is-object';
import { checkFieldNameDuplicates } from '#blockml/functions/build-field/check-field-name-duplicates/check-field-name-duplicates';
import { checkFieldUnknownParameters } from '#blockml/functions/build-field/check-field-unknown-parameters/check-field-unknown-parameters';
import { checkFieldsExist } from '#blockml/functions/build-field/check-fields-exist/check-fields-exist';
import { checkStoreFieldDetail } from '#blockml/functions/build-field/check-store-field-detail/check-store-field-detail';
import { checkStoreFieldGroup } from '#blockml/functions/build-field/check-store-field-group/check-store-field-group';
import { setImplicitLabel } from '#blockml/functions/build-field/set-implicit-label/set-implicit-label';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { sdrType } from '#common/types/sdr-type';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileStore } from '#common/zod/blockml/internal/file-store';

export function buildField<T extends sdrType>(item: {
  entities: T[];
  projectConfig: FileProjectConf;
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  let { cs } = item;

  let entities: T[] = item.entities;

  entities = checkFieldsExist(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkFieldIsObject(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkFieldDeclaration(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  // parameters added to fields

  entities = checkFieldNameDuplicates(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkFieldUnknownParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = setImplicitLabel(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = checkAndSetImplicitResult(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  if (item.caller === CallerEnum.BuildStoreField) {
    entities = checkStoreFieldGroup(
      {
        stores: entities as FileStore[],
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    ) as T[];

    entities = checkStoreFieldDetail(
      {
        stores: entities as FileStore[],
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    ) as T[];
  }

  entities = checkAndSetImplicitFormatNumber(
    {
      entities: entities,
      projectConfig: item.projectConfig,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return Result.succeed(entities);
}
