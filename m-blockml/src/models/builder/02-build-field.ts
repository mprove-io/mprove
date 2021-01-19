import { barField } from '../../barrels/bar-field';
import { enums } from '../../barrels/enums';
import { types } from '../../barrels/types';
import { BmError } from '../../models/bm-error';
import { api } from '../../barrels/api';
import { ConfigService } from '@nestjs/config';

export function buildField<T extends types.vmdType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  weekStart: api.ProjectWeekStartEnum;
  caller: enums.CallerEnum;
  cs: ConfigService;
}) {
  let entities = item.entities;

  entities = barField.checkFieldsExist({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkFieldIsObject({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkFieldDeclaration({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkSqlExist({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkFieldNameDuplicates({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkFieldUnknownParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.setImplicitLabel({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkDimensions({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.transformYesNoDimensions({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkMeasures({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkCalculations({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkAndSetImplicitResult({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkAndSetImplicitFormatNumber({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.transformTimes({
    weekStart: item.weekStart,
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.makeFieldsDeps({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkFieldsDeps({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.checkCycles({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller,
    cs: item.cs
  });

  entities = barField.substituteSingleRefs({
    errors: item.errors,
    structId: item.structId,
    entities: entities,
    caller: item.caller,
    cs: item.cs
  });

  return entities;
}
