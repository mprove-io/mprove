import { common } from '~api-to-backend/barrels/common';

export function processRowIds(item: {
  rows: common.Row[];
  targetRowIds: string[];
  replaceWithUndef?: string[];
}) {
  let { rows, targetRowIds, replaceWithUndef } = item;

  let targets: { [from: string]: string } = {};

  rows.forEach(row => {
    let rowId = row.rowId;
    let targetIndex = targetRowIds.findIndex(
      targetRowId => targetRowId === rowId
    );

    targets[rowId] = common.rowIdNumberToLetter(targetIndex);
  });

  // rows = rows.map(row => {
  //   row.rowId = targets[row.rowId];
  //   row.deps = [];
  //   return row;
  // });

  rows.forEach(row => {
    row.rowId = targets[row.rowId];
    row.deps = [];
  });

  rows.forEach(row => {
    if (row.rowType === common.RowTypeEnum.Formula) {
      //
      // console.log('row.formula:');
      // console.log(row.formula);

      let newFormula = row.formula;
      let formulaDeps: string[] = [];
      let reg = common.MyRegex.CAPTURE_ROW_REF();
      let r;

      while ((r = reg.exec(newFormula))) {
        let reference = r[1];

        let targetRow;

        if (common.isDefined(targets[reference])) {
          targetRow = rows.find(y => y.rowId === targets[reference]);
        }

        let targetTo =
          common.isDefined(targetRow) &&
          (targetRow.rowType === common.RowTypeEnum.Formula ||
            targetRow.rowType === common.RowTypeEnum.Metric)
            ? targets[reference]
            : common.isDefined(replaceWithUndef) &&
                replaceWithUndef.indexOf(reference) > -1
              ? common.UNDEF
              : reference;

        newFormula = common.MyRegex.replaceRowIds(
          newFormula,
          reference,
          targetTo
        );

        if (formulaDeps.indexOf(targetTo) < 0) {
          formulaDeps.push(targetTo);
        }
      }

      newFormula = newFormula.split(common.QUAD_UNDERSCORE).join('');

      row.formula = newFormula;

      formulaDeps.forEach(x => {
        if (row.deps.indexOf(x) < 0) {
          row.deps.push(x);
        }
      });

      row.formulaDeps = formulaDeps;
    }
  });

  let newRows = rows.sort((a, b) =>
    common.rowIdLetterToNumber(a.rowId) > common.rowIdLetterToNumber(b.rowId)
      ? 1
      : common.rowIdLetterToNumber(b.rowId) >
          common.rowIdLetterToNumber(a.rowId)
        ? -1
        : 0
  );

  newRows.forEach(row => {
    let startDeps = [...row.deps];
    let endDeps: string[] = [];

    while (startDeps.length !== endDeps.length) {
      startDeps.forEach(x => {
        if (endDeps.indexOf(x) < 0) {
          endDeps.push(x);
        }
      });

      endDeps.forEach(x => {
        if (startDeps.indexOf(x) < 0) {
          startDeps.push(x);
        }

        let depRow = rows.find(r => r.rowId === x);
        if (common.isDefined(depRow)) {
          depRow.deps.forEach(d => {
            if (endDeps.indexOf(d) < 0) {
              endDeps.push(d);
            }
          });
        }
      });
    }

    row.deps = endDeps;

    // console.log('row:');
    // console.log(row);

    // console.log('row.parameters:');
    // console.log(row.parameters);
  });

  return newRows;
}
