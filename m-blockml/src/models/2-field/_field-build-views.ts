import { barField } from '../../barrels/bar-field';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../../models/bm-error';

export function fieldBuildViews(item: {
  errors: BmError[];
  views: interfaces.View[];
}) {
  let views = item.views;

  views = barField.checkFieldsExist({
    entities: views,
    errors: item.errors
  });

  views = barField.checkFieldIsObject({
    entities: views,
    errors: item.errors
  });

  return {
    views: views
  };
}
