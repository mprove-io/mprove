import { interfaces } from '../../barrels/interfaces';
import { enums } from '../../barrels/enums';
import { constants } from '../../barrels/constants';
import { BmError } from '../bm-error';
import { helper } from '../../barrels/helper';

let func = enums.FuncEnum.ComposeMain;

export function composeMain(item: {
  myWith: interfaces.VarsSub['myWith'];
  mainText: interfaces.VarsSub['mainText'];
  contents: interfaces.VarsSub['contents'];
  groupMainBy: interfaces.VarsSub['groupMainBy'];
  varsSubArray: interfaces.ViewPart['varsSubElements'];
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { myWith, mainText, contents, groupMainBy, structId, caller } = item;

  let varsSubInput: interfaces.VarsSub = helper.makeCopy({
    myWith,
    mainText,
    contents,
    groupMainBy
  });

  let mainQuery: interfaces.VarsSub['mainQuery'] = [];

  mainQuery.push(`${constants.WITH}`);
  mainQuery = mainQuery.concat(myWith);
  mainQuery.push(`  ${constants.VIEW_MAIN} AS (`);
  mainQuery.push(`    ${constants.SELECT}`);

  if (mainText.length === 0) {
    mainQuery.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  mainQuery = mainQuery.concat(mainText.map(s => `    ${s}`));

  // chop
  let lastIndex = mainQuery.length - 1;
  mainQuery[lastIndex] = mainQuery[lastIndex].slice(0, -1);

  mainQuery = mainQuery.concat(contents.map(s => `    ${s}`));

  if (groupMainBy.length > 0) {
    let groupMainByString = groupMainBy.join(', ');

    mainQuery.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
    mainQuery.push('');
  }

  mainQuery.pop();
  mainQuery.push('  )');

  let output: interfaces.VarsSub = { mainQuery };

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
