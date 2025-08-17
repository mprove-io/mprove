import { ConfigService } from '@nestjs/config';
import { barField } from '~blockml/barrels/bar-field';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

export function buildField<T extends types.sdrType>(
  item: {
    entities: T[];
    projectConfig: common.FileProjectConf;
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let entities = item.entities;

  entities = barField.checkFieldsExist(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkFieldIsObject(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkFieldDeclaration(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  // parameters added to fields

  entities = barField.checkFieldNameDuplicates(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkFieldUnknownParameters(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.setImplicitLabel(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkAndSetImplicitResult(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  if (item.caller === common.CallerEnum.BuildStoreField) {
    entities = barField.checkStoreFieldGroup(
      {
        stores: entities as common.FileStore[],
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    ) as T[];

    entities = barField.checkStoreFieldDetail(
      {
        stores: entities as common.FileStore[],
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    ) as T[];
  }

  entities = barField.checkAndSetImplicitFormatNumber(
    {
      entities: entities,
      projectConfig: item.projectConfig,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  return entities;
}
