import { FieldClassEnum } from '#common/enums/field-class.enum';
import type { Mconfig } from '#common/zod/blockml/mconfig';
import type { ModelField } from '#common/zod/blockml/model-field';
import type { Sorting } from '#common/zod/blockml/sorting';

export function sortChartFieldsOnSelectChange<T extends Mconfig>(item: {
  mconfig: T;
  fields: ModelField[];
}) {
  let { mconfig, fields } = item;

  if (mconfig.select.length > 0) {
    let selectDimensions: string[] = [];

    mconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === FieldClassEnum.Dimension) {
        selectDimensions.push(field.id);
      }
    });

    if (mconfig.sortings.length === 0 && selectDimensions.length > 0) {
      let sorting: Sorting = {
        fieldId: selectDimensions[0],
        desc: false
      };
      mconfig.sortings = [sorting];
      mconfig.sorts = `${sorting.fieldId}`;
    }
  }

  return mconfig;
}
