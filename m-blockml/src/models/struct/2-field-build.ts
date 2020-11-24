import { barField } from '../../barrels/bar-field';
import { enums } from '../../barrels/enums';
import { types } from '../../barrels/types';
import { BmError } from '../../models/bm-error';
import { api } from '../../barrels/api';

export function fieldBuild<T extends types.vmdType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  weekStart: api.ProjectWeekStartEnum;
  caller: enums.CallerEnum;
}) {
  let entities = item.entities;

  entities = barField.checkFieldsExist({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkFieldIsObject({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkFieldDeclaration({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkSqlExist({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkFieldNameDuplicates({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkFieldUnknownParameters({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.setImplicitLabel({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkDimensions({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.transformYesNoDimensions({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkMeasures({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkCalculations({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkAndSetImplicitResult({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkAndSetImplicitFormatNumber({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.transformTimes({
    weekStart: item.weekStart,
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.makeFieldsDeps({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkFieldsDeps({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.checkCycles({
    entities: entities,
    structId: item.structId,
    errors: item.errors,
    caller: item.caller
  });

  entities = barField.substituteSingleRefs({
    errors: item.errors,
    structId: item.structId,
    entities: entities,
    caller: item.caller
  });

  return entities;
}
