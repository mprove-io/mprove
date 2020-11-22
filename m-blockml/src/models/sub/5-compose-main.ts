import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

export function composeMain(item: interfaces.VarsSub) {
  let main: string[] = [];

  main.push(`${constants.WITH}`);
  main = main.concat(item.with);
  main.push(`  ${constants.VIEW_MAIN} AS (`);
  main.push(`    ${constants.SELECT}`);

  if (item.mainText.length === 0) {
    main.push(`    1 as ${constants.NO_FIELDS_SELECTED},`);
  }

  main = main.concat(item.mainText.map(s => `    ${s}`));

  // chop
  main[main.length - 1] = main[main.length - 1].slice(0, -1);

  main = main.concat(item.contents.map(s => `    ${s}`));

  if (item.groupMainBy.length > 0) {
    let groupMainByString = item.groupMainBy.join(', ');

    main.push(`    ${constants.GROUP_BY} ${groupMainByString}`);
    main.push('');
  }

  main.pop();
  main.push('  )');

  item.query = main;

  return item;
}
