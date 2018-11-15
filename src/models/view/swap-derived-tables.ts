import { interfaces } from '../../barrels/interfaces';

export function swapDerivedTables(item: { views: interfaces.View[] }) {
  item.views.forEach(x => {
    if (x.derived_table_new) {
      x.derived_table = x.derived_table_new;

      delete x.derived_table_new;
    }
  });

  return item.views;
}
