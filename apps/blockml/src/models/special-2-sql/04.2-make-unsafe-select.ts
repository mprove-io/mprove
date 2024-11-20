import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';

let func = common.FuncEnum.MakeUnsafeSelect;

export function makeUnsafeSelect(item: {
  select: common.VarsSql['select'];
  joinAggregations: common.VarsSql['joinAggregations'];
  model: common.FileModel;
  varsSqlSteps: common.FilePartTile['varsSqlSteps'];
}) {
  let { select, joinAggregations, model, varsSqlSteps } = item;

  let varsInput = common.makeCopy<common.VarsSql>({
    select,
    joinAggregations
  });

  let unsafeSelect: string[] = [];
  let warnSelect: string[] = [];

  select.forEach(element => {
    let r =
      common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G().exec(element);

    let asName = r[1];
    let fieldName = r[2];

    let field: common.FieldAny =
      asName === constants.MF
        ? model.fields.find(mField => mField.name === fieldName)
        : model.joins
            .find(j => j.as === asName)
            .view.fields.find(vField => vField.name === fieldName);

    if (field.fieldClass === common.FieldClassEnum.Measure) {
      if (asName !== constants.MF) {
        let joinAggregation = joinAggregations.find(x => x.joinAs === asName);

        if (
          joinAggregation.isSafeAggregation === false &&
          unsafeSelect.indexOf(element) < 0
        ) {
          unsafeSelect.push(element);

          if (
            common.SAFE_AGGREGATION_MEASURE_TYPES.indexOf(field.type) < 0 &&
            warnSelect.indexOf(element) < 0
          ) {
            warnSelect.push(element);
          }
        }
      } else {
        if (common.isDefined(model.fieldsDoubleDepsAfterSingles[fieldName])) {
          Object.keys(model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
            asDep => {
              if (
                Object.keys(
                  model.fieldsDoubleDepsAfterSingles[fieldName][asDep]
                ).length > 0
              ) {
                let joinAggregation = joinAggregations.find(
                  x => x.joinAs === asDep
                );

                if (
                  joinAggregation.isSafeAggregation === false &&
                  unsafeSelect.indexOf(element) < 0
                ) {
                  unsafeSelect.push(element);

                  if (
                    common.SAFE_AGGREGATION_MEASURE_TYPES.indexOf(field.type) <
                      0 &&
                    warnSelect.indexOf(element) < 0
                  ) {
                    warnSelect.push(element);
                  }
                }
              }
            }
          );
        }
      }
    } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
      if (asName !== constants.MF) {
        let view = model.joins.find(j => j.as === asName).view;

        Object.keys(view.fieldsDepsAfterSingles[fieldName]).forEach(depName => {
          let depViewField = view.fields.find(
            vField => vField.name === depName
          );

          if (depViewField.fieldClass === common.FieldClassEnum.Measure) {
            let joinAggregation = joinAggregations.find(
              x => x.joinAs === asName
            );

            if (
              joinAggregation.isSafeAggregation === false &&
              unsafeSelect.indexOf(element) < 0
            ) {
              unsafeSelect.push(element);

              if (
                common.SAFE_AGGREGATION_MEASURE_TYPES.indexOf(
                  depViewField.type
                ) < 0 &&
                warnSelect.indexOf(element) < 0
              ) {
                warnSelect.push(element);
              }
            }
          }
        });
      } else {
        Object.keys(model.fieldsDoubleDepsAfterSingles[fieldName]).forEach(
          alias => {
            Object.keys(
              model.fieldsDoubleDepsAfterSingles[fieldName][alias]
            ).forEach(depName => {
              let join = model.joins.find(j => j.as === alias);

              let depViewField = join.view.fields.find(
                vField => vField.name === depName
              );

              if (depViewField.fieldClass === common.FieldClassEnum.Measure) {
                let joinAggregation = joinAggregations.find(
                  x => x.joinAs === alias
                );

                if (
                  joinAggregation.isSafeAggregation === false &&
                  unsafeSelect.indexOf(element) < 0
                ) {
                  unsafeSelect.push(element);

                  if (
                    common.SAFE_AGGREGATION_MEASURE_TYPES.indexOf(
                      depViewField.type
                    ) < 0 &&
                    warnSelect.indexOf(element) < 0
                  ) {
                    warnSelect.push(element);
                  }
                }
              }
            });
          }
        );

        Object.keys(model.fieldsDepsAfterSingles[fieldName]).forEach(
          depName => {
            let depModelField = model.fields.find(
              mField => mField.name === depName
            );

            if (depModelField.fieldClass === common.FieldClassEnum.Measure) {
              Object.keys(model.fieldsDoubleDepsAfterSingles[depName]).forEach(
                alias => {
                  if (
                    Object.keys(
                      model.fieldsDoubleDepsAfterSingles[depName][alias]
                    ).length > 0
                  ) {
                    let joinAggregation = joinAggregations.find(
                      x => x.joinAs === alias
                    );

                    if (
                      joinAggregation.isSafeAggregation === false &&
                      unsafeSelect.indexOf(element) < 0
                    ) {
                      unsafeSelect.push(element);

                      if (
                        common.SAFE_AGGREGATION_MEASURE_TYPES.indexOf(
                          depModelField.type
                        ) < 0 &&
                        warnSelect.indexOf(element) < 0
                      ) {
                        warnSelect.push(element);
                      }
                    }
                  }
                }
              );
            }
          }
        );
      }
    }
  });

  let varsOutput: common.VarsSql = {
    unsafeSelect: unsafeSelect,
    warnSelect: warnSelect
  };

  varsSqlSteps.push({ func, varsInput, varsOutput });

  return varsOutput;
}
