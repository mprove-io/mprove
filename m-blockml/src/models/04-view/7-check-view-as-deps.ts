import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { api } from '../../barrels/api';
import { BmError } from '../bm-error';
import { interfaces } from '../../barrels/interfaces';
import { constants } from '../../barrels/constants';

let func = enums.FuncEnum.CheckViewAsDeps;

export function checkViewAsDeps(item: {
  views: interfaces.View[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newViews: interfaces.View[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (Object.keys(x.asDeps).length > 0) {
      Object.keys(x.asDeps).forEach(as => {
        let referencedViewName = x.asDeps[as].viewName;

        let referencedView = item.views.find(
          v => v.name === referencedViewName
        );

        if (helper.isUndefined(referencedView)) {
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.DERIVED_TABLE_REFERENCES_MISSING_VIEW,
              message:
                `${enums.ParameterEnum.DerivedTable} has reference to missing ` +
                `view "${referencedViewName}"`,
              lines: [
                {
                  line: x.derived_table_line_num,
                  name: x.fileName,
                  path: x.filePath
                }
              ]
            })
          );
          return;
        }

        if (helper.isDefined(referencedView.derived_table)) {
          let input = referencedView.derived_table;

          let reg = api.MyRegex.CAPTURE_START_FIELD_TARGET_END();
          let r = reg.exec(input);

          if (r) {
            item.errors.push(
              new BmError({
                title:
                  enums.ErTitleEnum
                    .DERIVED_TABLE_REFERENCED_VIEW_HAS_APPLY_FILTER,
                message:
                  `${enums.ParameterEnum.DerivedTable} can not reference views that ` +
                  `have ${constants.APPLY_FILTER}. Found reference of view "${referencedViewName}"`,
                lines: [
                  {
                    line: x.derived_table_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        }

        Object.keys(x.asDeps[as].fieldNames).forEach(fieldName => {
          let field = referencedView.fields.find(f => f.name === fieldName);

          if (helper.isUndefined(field)) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.DERIVED_TABLE_REFERENCES_MISSING_FIELD,
                message: `Found referencing field "${fieldName}" of view "${referencedView.name}"`,
                lines: [
                  {
                    line: x.derived_table_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          } else if (field.fieldClass === enums.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: enums.ErTitleEnum.DERIVED_TABLE_REFERENCES_FILTER,
                message:
                  `Found referencing Filter "${fieldName}" of view "${referencedView.name}".` +
                  `${enums.ParameterEnum.DerivedTable} can not reference Filter fields`,
                lines: [
                  {
                    line: x.derived_table_line_num,
                    name: x.fileName,
                    path: x.filePath
                  }
                ]
              })
            );
            return;
          }
        });
      });
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
    }
  });

  // return zero views if at least 1 error found (no restart needed)
  newViews = item.views.length === newViews.length ? newViews : [];

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
