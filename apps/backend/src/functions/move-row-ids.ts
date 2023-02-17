import { common } from '~api-to-backend/barrels/common';

export function moveRowIds(item: {
  rows: common.Row[];
  rowChanges: common.RowChange[];
}) {
  let { rows, rowChanges } = item;

  let targets: { [from: string]: string } = {};

  rows.forEach(row => {
    let rowId = row.rowId;
    let rowChangeIndex = rowChanges.findIndex(
      rowChange => rowChange.rowId === rowId
    );
    targets[rowId] = common.idxNumberToLetter(rowChangeIndex);
  });

  rows
    .map(row => {
      row.rowId = targets[row.rowId];
      return row;
    })
    .filter(row => common.isDefined(row.formula))
    .forEach(row => {
      let newFormula = row.formula;
      let reg = common.MyRegex.CAPTURE_ROW_REF();
      let r;

      while ((r = reg.exec(newFormula))) {
        let reference = r[1];
        let targetTo = targets[reference];

        newFormula = common.MyRegex.replaceRowIds(
          newFormula,
          reference,
          targetTo
        );
      }

      newFormula = newFormula.split(common.QUAD_UNDERSCORE).join('');

      row.formula = newFormula;
    });

  let newRows = rows.sort((a, b) =>
    common.idxLetterToNumber(a.rowId) > common.idxLetterToNumber(b.rowId)
      ? 1
      : common.idxLetterToNumber(b.rowId) > common.idxLetterToNumber(a.rowId)
      ? -1
      : 0
  );

  return newRows;
}
