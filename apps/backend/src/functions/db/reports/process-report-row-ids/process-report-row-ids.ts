import { reportRowIdLetterToNumber } from '#backend/functions/db/reports/report-row-id-letter-to-number/report-row-id-letter-to-number';
import { reportRowIdNumberToLetter } from '#backend/functions/db/reports/report-row-id-number-to-letter/report-row-id-number-to-letter';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { QUAD_UNDERSCORE, UNDEF } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Row } from '#common/types/blockml/parts/report/row/row';

export function processReportRowIds(item: {
  rows: Row[];
  targetRowIds: string[];
  replaceWithUndef?: string[];
}): Row[] {
  let { rows, targetRowIds, replaceWithUndef } = item;

  let targets: { [from: string]: string } = {};

  rows.forEach(row => {
    let rowId = row.rowId;
    let targetIndex: number = targetRowIds.findIndex(
      targetRowId => targetRowId === rowId
    );

    targets[rowId] = reportRowIdNumberToLetter({ rowIdNumber: targetIndex });
  });

  rows.forEach(row => {
    row.rowId = targets[row.rowId];
    row.deps = [];
  });

  rows.forEach(row => {
    if (row.rowType === 'formula') {
      let newFormula = row.formula;

      let formulaDeps: string[] = [];

      let reg: RegExp = MyRegex.CAPTURE_ROW_REF();

      let r: RegExpExecArray;

      while ((r = reg.exec(newFormula))) {
        let reference = r[1];

        let targetRow: Row;

        if (isDefined(targets[reference])) {
          targetRow = rows.find(y => y.rowId === targets[reference]);
        }

        let targetTo =
          isDefined(targetRow) &&
          (targetRow.rowType === 'formula' || targetRow.rowType === 'metric')
            ? targets[reference]
            : isDefined(replaceWithUndef) &&
                replaceWithUndef.indexOf(reference) > -1
              ? UNDEF
              : reference;

        newFormula = MyRegex.replaceRowIds(newFormula, reference, targetTo);

        if (formulaDeps.indexOf(targetTo) < 0) {
          formulaDeps.push(targetTo);
        }
      }

      newFormula = newFormula.split(QUAD_UNDERSCORE).join('');

      row.formula = newFormula;

      formulaDeps.forEach(x => {
        if (row.deps.indexOf(x) < 0) {
          row.deps.push(x);
        }
      });

      row.formulaDeps = formulaDeps;
    }
  });

  let newRows: Row[] = rows.sort((a, b) =>
    reportRowIdLetterToNumber({ rowId: a.rowId }) >
    reportRowIdLetterToNumber({ rowId: b.rowId })
      ? 1
      : reportRowIdLetterToNumber({ rowId: b.rowId }) >
          reportRowIdLetterToNumber({ rowId: a.rowId })
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

        let depRow: Row = rows.find(r => r.rowId === x);

        if (isDefined(depRow)) {
          depRow.deps.forEach(d => {
            if (endDeps.indexOf(d) < 0) {
              endDeps.push(d);
            }
          });
        }
      });
    }

    row.deps = endDeps;
  });

  return newRows;
}
