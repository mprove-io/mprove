import { barField } from '../../barrels/bar-field';
import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { BmError } from '../../models/bm-error';

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

  return {
    views: views
  };
}
