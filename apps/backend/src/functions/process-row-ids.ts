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
      row.deps = [];
      return row;
    })
    .forEach(row => {
      if (row.rowType === common.RowTypeEnum.Formula) {
        //
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
        row.deps = [...row.deps, ...formulaDeps];
      } else if (common.isDefined(row.parametersFormula)) {
        //
        let newParametersFormula = row.parametersFormula;
        let parametersFormulaDeps: string[] = [];
        let reg = common.MyRegex.CAPTURE_ROW_REF();
        let r;

        while ((r = reg.exec(newParametersFormula))) {
          let reference = r[1];

          let targetTo = common.isDefined(targets[reference])
            ? targets[reference]
            : common.UNDEF;

          newParametersFormula = common.MyRegex.replaceRowIds(
            newParametersFormula,
            reference,
            targetTo
          );

          parametersFormulaDeps.push(targetTo);
        }

        newParametersFormula = newParametersFormula
          .split(common.QUAD_UNDERSCORE)
          .join('');

        row.parametersFormula = newParametersFormula;
        row.parametersFormulaDeps = parametersFormulaDeps;
        row.deps = [...row.deps, ...parametersFormulaDeps];
      } else if (common.isDefined(row.parameters)) {
        //
        row.parameters.forEach(p => {
          let newParId = `$${p.parameterId}`;
          let reg1 = common.MyRegex.CAPTURE_ROW_REF();
          let r1;

          while ((r1 = reg1.exec(newParId))) {
            let ref = r1[1];

            let targetTo = common.isDefined(targets[ref])
              ? targets[ref]
              : common.UNDEF;

            newParId = common.MyRegex.replaceRowIds(newParId, ref, targetTo);
          }

          newParId = newParId.split(common.QUAD_UNDERSCORE).join('');

          p.parameterId = newParId.split('$')[1];

          if (common.isDefined(p.formula)) {
            // console.log('p.parameterId');
            // console.log(p.parameterId);

            // console.log('p.formula');
            // console.log(p.formula);

            let newParFormula = p.formula;
            let parFormulaDeps: string[] = [];
            let reg = common.MyRegex.CAPTURE_ROW_REF();
            let r;

            while ((r = reg.exec(newParFormula))) {
              let reference = r[1];

              let targetTo = common.isDefined(targets[reference])
                ? targets[reference]
                : common.UNDEF;

              newParFormula = common.MyRegex.replaceRowIds(
                newParFormula,
                reference,
                targetTo
              );

              parFormulaDeps.push(targetTo);
            }

            newParFormula = newParFormula
              .split(common.QUAD_UNDERSCORE)
              .join('');

            p.formula = newParFormula;
            p.formulaDeps = parFormulaDeps;
            row.deps = [...row.deps, ...parFormulaDeps];
            // console.log('newParFormula');
            // console.log(newParFormula);
          }
        });
      }
    });

  rows.forEach(row => {
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
