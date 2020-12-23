import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.MakeNeedsAll;

export function makeNeedsAll(item: {
  selected: interfaces.VarsSub['selected'];
  varsSubArray: interfaces.ViewPart['varsSubElements'];
  view: interfaces.VarsSub['view'];
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { selected, view, structId, caller } = item;

  let varsSubInput: interfaces.VarsSub = helper.makeCopy({ selected });

  let needsAll: interfaces.VarsSub['needsAll'] = {};

  Object.keys(selected).forEach(fieldName => {
    needsAll[fieldName] = 1;

    Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
      needsAll[dep] = 1;
    });
  });

  // item.needsAll = needsAll;

  let output: interfaces.VarsSub = { needsAll };

  let varsSubElement: interfaces.VarsSubElement = {
    func: func,
    varsSubInput: varsSubInput,
    varsSubOutput: output
  };
  item.varsSubArray.push(varsSubElement);

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, item.views);

  return output;
}
