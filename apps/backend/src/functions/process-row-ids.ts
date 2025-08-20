import { QUAD_UNDERSCORE, UNDEF } from '~common/constants/top';
import { RowTypeEnum } from '~common/enums/row-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { rowIdLetterToNumber } from '~common/functions/row-id-letter-to-number';
import { rowIdNumberToLetter } from '~common/functions/row-id-number-to-letter';
import { Row } from '~common/interfaces/blockml/row';
import { MyRegex } from '~common/models/my-regex';

export function processRowIds(item: {
  rows: Row[];
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

    targets[rowId] = rowIdNumberToLetter(targetIndex);
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
    if (row.rowType === RowTypeEnum.Formula) {
      //
      // console.log('row.formula:');
      // console.log(row.formula);

      let newFormula = row.formula;
      let formulaDeps: string[] = [];
      let reg = MyRegex.CAPTURE_ROW_REF();
      let r;

      while ((r = reg.exec(newFormula))) {
        let reference = r[1];

        let targetRow;

        if (isDefined(targets[reference])) {
          targetRow = rows.find(y => y.rowId === targets[reference]);
        }

        let targetTo =
          isDefined(targetRow) &&
          (targetRow.rowType === RowTypeEnum.Formula ||
            targetRow.rowType === RowTypeEnum.Metric)
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

  let newRows = rows.sort((a, b) =>
    rowIdLetterToNumber(a.rowId) > rowIdLetterToNumber(b.rowId)
      ? 1
      : rowIdLetterToNumber(b.rowId) > rowIdLetterToNumber(a.rowId)
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

    // console.log('row:');
    // console.log(row);

    // console.log('row.parameters:');
    // console.log(row.parameters);
  });

  return newRows;
}
