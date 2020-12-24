import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.SubMakeNeedsAll;

export function subMakeNeedsAll(item: {
  selected: interfaces.VarsSub['selected'];
  varsSubElements: interfaces.ViewPart['varsSubElements'];
  view: interfaces.View;
}) {
  let { selected, view } = item;

  let varsSubInput: interfaces.VarsSub = helper.makeCopy({ selected });

  let needsAll: interfaces.VarsSub['needsAll'] = {};

  Object.keys(selected).forEach(fieldName => {
    needsAll[fieldName] = 1;

    Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
      needsAll[dep] = 1;
    });
  });

  let output: interfaces.VarsSub = { needsAll };

  item.varsSubElements.push({
    func: func,
    varsSubInput: varsSubInput,
    varsSubOutput: output
  });

  return output;
}
