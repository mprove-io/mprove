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

  rows = rows.map(row => {
    row.rowId = targets[row.rowId];
    row.deps = [];
    return row;
  });

  rows.forEach(row => {
    if (row.rowType === common.RowTypeEnum.Formula) {
      //
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
            : common.UNDEF;

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
    } else if (common.isDefined(row.parametersFormula)) {
      //
      let newParametersFormula = row.parametersFormula;
      let parametersFormulaDeps: string[] = [];
      let reg = common.MyRegex.CAPTURE_ROW_REF();
      let r;

      while ((r = reg.exec(newParametersFormula))) {
        let reference = r[1];

        let targetRow;

        if (common.isDefined(targets[reference])) {
          targetRow = rows.find(y => y.rowId === targets[reference]);
        }

        let targetTo =
          common.isDefined(targetRow) &&
          targetRow.rowType === common.RowTypeEnum.Metric
            ? targets[reference]
            : common.UNDEF;

        newParametersFormula = common.MyRegex.replaceRowIds(
          newParametersFormula,
          reference,
          targetTo
        );

        if (parametersFormulaDeps.indexOf(targetTo) < 0) {
          parametersFormulaDeps.push(targetTo);
        }
      }

      newParametersFormula = newParametersFormula
        .split(common.QUAD_UNDERSCORE)
        .join('');

      row.parametersFormula = newParametersFormula;

      parametersFormulaDeps.forEach(x => {
        if (row.deps.indexOf(x) < 0) {
          row.deps.push(x);
        }
      });
    } else if (common.isDefined(row.parameters)) {
      //
      row.parameters.forEach(p => {
        let newParId = `$${p.parameterId}`;
        let reg1 = common.MyRegex.CAPTURE_ROW_REF();
        let r1;

        while ((r1 = reg1.exec(newParId))) {
          let ref = r1[1];

          let targetRow;

          if (common.isDefined(targets[ref])) {
            targetRow = rows.find(y => y.rowId === targets[ref]);
          }

          let targetTo =
            common.isDefined(targetRow) &&
            targetRow.rowType === common.RowTypeEnum.Metric
              ? targets[ref]
              : common.UNDEF;

          newParId = common.MyRegex.replaceRowIds(newParId, ref, targetTo);
        }

        newParId = newParId.split(common.QUAD_UNDERSCORE).join('');

        p.parameterId = newParId.split('$')[1];

        if (common.isDefined(p.formula)) {
          let newParFormula = p.formula;
          let parFormulaDeps: string[] = [];
          let reg = common.MyRegex.CAPTURE_ROW_REF();
          let r;

          while ((r = reg.exec(newParFormula))) {
            let reference = r[1];

            let targetRow;

            if (common.isDefined(targets[reference])) {
              targetRow = rows.find(y => y.rowId === targets[reference]);
            }

            let targetTo =
              common.isDefined(targetRow) &&
              targetRow.rowType === common.RowTypeEnum.Metric
                ? targets[reference]
                : common.UNDEF;

            newParFormula = common.MyRegex.replaceRowIds(
              newParFormula,
              reference,
              targetTo
            );

            if (parFormulaDeps.indexOf(targetTo) < 0) {
              parFormulaDeps.push(targetTo);
            }
          }

          newParFormula = newParFormula.split(common.QUAD_UNDERSCORE).join('');

          p.formula = newParFormula;

          parFormulaDeps.forEach(x => {
            if (row.deps.indexOf(x) < 0) {
              row.deps.push(x);
            }
          });
        }
      });
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
  });

  return newRows;
}
