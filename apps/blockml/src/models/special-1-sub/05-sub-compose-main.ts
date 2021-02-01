import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';

let func = enums.FuncEnum.SubComposeMain;

export function subComposeMain(item: {
  myWith: interfaces.VarsSub['myWith'];
  mainText: interfaces.VarsSub['mainText'];
  groupMainBy: interfaces.VarsSub['groupMainBy'];
  varsSubSteps: interfaces.ViewPart['varsSubSteps'];
  view: interfaces.View;
}) {
  let { myWith, mainText, groupMainBy, varsSubSteps, view } = item;

  let varsInput = helper.makeCopy<interfaces.VarsSub>({
    myWith,
    mainText,
    groupMainBy
  });

  let mainQuery: interfaces.VarsSub['mainQuery'] = [];

  mainQuery.push(`${constants.WITH}`);
  mainQuery = mainQuery.concat(myWith);
  mainQuery.push(`  ${constants.MAIN}__${view.name} AS (`);
  mainQuery.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    mainQuery.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  mainQuery = mainQuery.concat(mainText.map(s => `    ${s}`));

  helper.chopLastElement(mainQuery);

  mainQuery.push(`    ${constants.FROM} ${constants.VIEW}__${view.name}`);

  if (groupMainBy.length > 0) {
    let groupMainByString = groupMainBy.join(', ');

    mainQuery.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
  }

  mainQuery.push('  )');

  let varsOutput: interfaces.VarsSub = { mainQuery };

  varsSubSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
