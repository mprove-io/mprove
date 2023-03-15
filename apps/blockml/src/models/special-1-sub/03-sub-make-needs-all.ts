import { common } from '~blockml/barrels/common';

let func = common.FuncEnum.SubMakeNeedsAll;

export function subMakeNeedsAll(item: {
  selected: common.VarsSub['selected'];
  varsSubSteps: common.FileViewPart['varsSubSteps'];
  view: common.FileView;
}) {
  let { selected, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<common.VarsSub>({ selected });

  let needsAll: common.VarsSub['needsAll'] = {};

  Object.keys(selected).forEach(fieldName => {
    needsAll[fieldName] = 1;

    Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(dep => {
      needsAll[dep] = 1;
    });
  });

  let varsOutput: common.VarsSub = { needsAll };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
