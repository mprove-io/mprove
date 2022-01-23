import { common } from '~front/barrels/common';

export function sortChartFieldsOnSelectChange(item: {
  newMconfig: common.MconfigX;
  fields: common.ModelField[];
}) {
  let { newMconfig, fields } = item;

  if (newMconfig.select.length > 0) {
    let selectDimensions: string[] = [];

    newMconfig.select.forEach((fieldId: string) => {
      let field = fields.find(f => f.id === fieldId);

      if (field.fieldClass === common.FieldClassEnum.Dimension) {
        selectDimensions.push(field.id);
      }
    });

    if (newMconfig.sortings.length === 0 && selectDimensions.length > 0) {
      let sorting: common.Sorting = {
        fieldId: selectDimensions[0],
        desc: false
      };
      newMconfig.sortings = [sorting];
      newMconfig.sorts = `${sorting.fieldId}`;
    }
  }

  return newMconfig;
}
