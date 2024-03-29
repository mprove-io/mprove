import { common } from '~blockml/barrels/common';
import { enums } from '~blockml/barrels/enums';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.SubMakeNeedsAll;

export function subMakeNeedsAll(item: {
  selected: interfaces.VarsSub['selected'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { selected, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<interfaces.VarsSub>({ selected });

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
