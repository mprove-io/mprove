import { ConfigService } from '@nestjs/config';
import { barField } from '~blockml/barrels/bar-field';
import { BmError } from '~blockml/models/bm-error';

export function buildField<T extends sdrType>(
  item: {
    entities: T[];
    projectConfig: FileProjectConf;
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
  },
  cs: ConfigService<BlockmlConfig>
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

  if (item.caller === CallerEnum.BuildStoreField) {
    entities = barField.checkStoreFieldGroup(
      {
        stores: entities as FileStore[],
        structId: item.structId,
        errors: item.errors,
        caller: item.caller
      },
      cs
    ) as T[];

    entities = barField.checkStoreFieldDetail(
      {
        stores: entities as FileStore[],
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
