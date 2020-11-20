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
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkFieldIsObject({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkFieldDeclaration({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkSqlExist({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkFieldNameDuplicates({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkFieldUnknownParameters({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.setImplicitLabel({
    entities: entities,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkDimensions({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.transformYesNoDimensions({
    entities: entities,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkMeasures({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkCalculations({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkAndSetImplicitResult({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkAndSetImplicitFormatNumber({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.transformTimes({
    weekStart: item.weekStart,
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.makeFieldsDeps({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkFieldsDeps({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.checkCycles({
    entities: entities,
    errors: item.errors,
    structId: item.structId,
    caller: item.caller
  });

  entities = barField.substituteSingleRefs({
    entities: entities,
    structId: item.structId,
    caller: item.caller
  });

  return entities;
}
