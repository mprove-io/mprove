import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.SubComposeMain;

export function subComposeMain(item: {
  myWith: interfaces.VarsSub['myWith'];
  mainText: interfaces.VarsSub['mainText'];
  contents: interfaces.VarsSub['contents'];
  groupMainBy: interfaces.VarsSub['groupMainBy'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { myWith, mainText, contents, groupMainBy, varsSubSteps, view } = item;

  let varsInput: interfaces.VarsSub = helper.makeCopy({
    myWith,
    mainText,
    contents,
    groupMainBy
  });

  let mainQuery: interfaces.VarsSub['mainQuery'] = [];

  mainQuery.push(`${constants.WITH}`);
  mainQuery = mainQuery.concat(myWith);
  mainQuery = mainQuery.concat(contents);
  mainQuery.push(`  ${view.name}${constants.VIEW_MAIN_SUFFIX} AS (`);
  mainQuery.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    mainQuery.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  mainQuery = mainQuery.concat(mainText.map(s => `    ${s}`));

  // chop
  let lastIndex = mainQuery.length - 1;
  mainQuery[lastIndex] = mainQuery[lastIndex].slice(0, -1);

  // mainQuery = mainQuery.concat(contents.map(s => `    ${s}`));
  mainQuery.push(
    `    ${constants.FROM} ${view.name}${constants.VIEW_START_SUFFIX}`
  );

  if (groupMainBy.length > 0) {
    let groupMainByString = groupMainBy.join(', ');

    mainQuery.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
    mainQuery.push('');
  }

  mainQuery.pop();
  mainQuery.push('  )');

  let varsOutput: interfaces.VarsSub = { mainQuery };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
