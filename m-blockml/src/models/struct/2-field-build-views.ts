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

  // views = barField.checkCalculations({ entities: views });
  // views = barField.checkAndSetImplicitResults({ entities: views });
  // views = barField.checkAndSetImplicitFormatNumber({ entities: views });
  // views = barField.transformTimes({
  //   entities: views,
  //   weekStart: item.weekStart,
  //   connection: item.connection
  // });
  // // ->check_chars_in_refs
  // views = barField.makeFieldsDeps({ entities: views });
  // // with restart
  // views = barField.checkFieldsDeps({ entities: views });
  // views = barField.checkCycles({ entities: views });
  // // {fields_deps_after_singles: ...} , {prep_force_dims: ...}
  // views = barField.substituteSingleRefs({ entities: views });

  return {
    views: views
  };
}
