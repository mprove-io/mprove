import { common } from '~api-to-backend/barrels/common';

export function processRowIds(item: {
  rows: common.Row[];
  targetRowIds: string[];
}) {
  let { rows, targetRowIds } = item;

  let targets: { [from: string]: string } = {};

  rows.forEach(row => {
    let rowId = row.rowId;
    let targetIndex = targetRowIds.findIndex(
      targetRowId => targetRowId === rowId
    );
    targets[rowId] = common.rowIdNumberToLetter(targetIndex);
  });

  rows
    .map(row => {
      row.rowId = targets[row.rowId];
      return row;
    })
    .filter(row => common.isDefined(row.formula))
    .forEach(row => {
      let newFormula = row.formula;
      let formulaDeps: string[] = [];
      let reg = common.MyRegex.CAPTURE_ROW_REF();
      let r;

      while ((r = reg.exec(newFormula))) {
        let reference = r[1];

        let targetTo = common.isDefined(targets[reference])
          ? targets[reference]
          : common.UNDEF;

        newFormula = common.MyRegex.replaceRowIds(
          newFormula,
          reference,
          targetTo
        );

        formulaDeps.push(targetTo);
      }

      newFormula = newFormula.split(common.QUAD_UNDERSCORE).join('');

      row.formula = newFormula;
      row.formulaDeps = formulaDeps;
    });

  let newRows = rows.sort((a, b) =>
    common.rowIdLetterToNumber(a.rowId) > common.rowIdLetterToNumber(b.rowId)
      ? 1
      : common.rowIdLetterToNumber(b.rowId) >
        common.rowIdLetterToNumber(a.rowId)
      ? -1
      : 0
  );

  return newRows;
}
