import { ConfigService } from '@nestjs/config';
import { barField } from '~blockml/barrels/bar-field';
import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

export function buildField<T extends types.vmdType>(
  item: {
    entities: Array<T>;
    errors: BmError[];
    structId: string;
    weekStart: common.ProjectWeekStartEnum;
    caller: enums.CallerEnum;
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

  entities = barField.checkSqlExist(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

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

  entities = barField.checkDimensions(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.transformYesNoDimensions(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkMeasures(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkCalculations(
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

  entities = barField.checkAndSetImplicitFormatNumber(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.transformTimes(
    {
      weekStart: item.weekStart,
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.makeFieldsDeps(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkFieldsDeps(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.checkCycles(
    {
      entities: entities,
      structId: item.structId,
      errors: item.errors,
      caller: item.caller
    },
    cs
  );

  entities = barField.substituteSingleRefs(
    {
      errors: item.errors,
      structId: item.structId,
      entities: entities,
      caller: item.caller
    },
    cs
  );

  return entities;
}
