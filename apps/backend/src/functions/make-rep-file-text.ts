import { common } from '~backend/barrels/common';

export function makeRepFileText(item: {
  repId: string;
  title: string;
  rows: common.Row[];
}) {
  let { repId, title, rows } = item;

  let repFileText = common.toYaml({
    report: repId,
    title: title,
    rows: rows
  });

  return repFileText;
}
