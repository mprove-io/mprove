import { interfaces } from '../../barrels/interfaces';

export function composeMain(item: interfaces.VarsSub) {

  let main: string[] = [];

  main.push(`WITH`);
  main = main.concat(item.with);
  main.push(`  view_main AS (`);
  main.push(`    SELECT`);

  if (item.main_text.length === 0) {
    main.push(`    1 as no_fields_selected,`);
  }

  main = main.concat(item.main_text.map(s => `    ${s}`));

  // chop
  main[main.length - 1] = main[main.length - 1].slice(0, -1);

  main = main.concat(item.contents.map(s => `    ${s}`));

  if (item.group_main_by.length > 0) {

    let groupMainByString = item.group_main_by.join(`, `);

    main.push(`    GROUP BY ${groupMainByString}`);
    main.push(``);
  }

  main.pop();
  main.push(`  )`);

  item.query = main;

  return item;
}
