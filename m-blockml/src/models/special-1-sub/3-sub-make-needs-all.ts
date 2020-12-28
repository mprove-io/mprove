import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.SubMakeNeedsAll;

export function subMakeNeedsAll(item: {
  selected: interfaces.VarsSub['selected'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { selected, varsSubSteps, view } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSub>({ selected });

  let needsAll: interfaces.VarsSub['needsAll'] = {};

  Object.keys(selected).forEach(fieldName => {
    needsAll[fieldName] = 1;

    Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
      needsAll[dep] = 1;
    });
  });

  let varsOutput: interfaces.VarsSub = { needsAll };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
