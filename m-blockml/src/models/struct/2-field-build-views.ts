import { barField } from '../../barrels/bar-field';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';
import { api } from '../../barrels/api';

let caller = enums.CallerEnum.FieldBuildViews;

export function fieldBuildViews(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  weekStart: api.ProjectWeekStartEnum;
}) {
  let views = item.views;

  views = barField.checkFieldsExist({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkFieldIsObject({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkFieldDeclaration({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkSqlExist({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkFieldNameDuplicates({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkFieldUnknownParameters({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.setImplicitLabel({
    entities: views,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkDimensions({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.transformYesNoDimensions({
    entities: views,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkMeasures({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkCalculations({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkAndSetImplicitResult({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkAndSetImplicitFormatNumber({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.transformTimes({
    weekStart: item.weekStart,
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.makeFieldsDeps({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkFieldsDeps({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.checkCycles({
    entities: views,
    errors: item.errors,
    structId: item.structId,
    caller: caller
  });

  views = barField.substituteSingleRefs({
    entities: views,
    structId: item.structId,
    caller: caller
  });

  return {
    views: views
  };
}
