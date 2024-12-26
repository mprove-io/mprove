import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';

let func = common.FuncEnum.SubComposeMain;

export function subComposeMain(item: {
  myWith: common.VarsSub['myWith'];
  mainText: common.VarsSub['mainText'];
  groupMainBy: common.VarsSub['groupMainBy'];
  varsSubSteps: common.FileViewPart['varsSubSteps'];
  view: common.FileView;
}) {
  let { myWith, mainText, groupMainBy, varsSubSteps, view } = item;

  let varsInput = common.makeCopy<common.VarsSub>({
    myWith,
    mainText,
    groupMainBy
  });

  let mainQuery: common.VarsSub['mainQuery'] = [];

  mainQuery.push(`${constants.WITH}`);
  mainQuery = mainQuery.concat(myWith);
  mainQuery.push(`  ${constants.MAIN}__${view.name} AS (`);
  mainQuery.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    mainQuery.push(`    1 as ${common.NO_FIELDS_SELECTED},`);
  }

  mainQuery = mainQuery.concat(mainText.map(s => `    ${s}`));

  helper.chopLastElement(mainQuery);

  mainQuery.push(`    ${constants.FROM} ${constants.VIEW}__${view.name}`);

  if (groupMainBy.length > 0) {
    let groupMainByString = groupMainBy.join(', ');

    mainQuery.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
  }

  mainQuery.push('  )');

  let varsOutput: common.VarsSub = { mainQuery };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
