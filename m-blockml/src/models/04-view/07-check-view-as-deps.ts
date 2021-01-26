import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { constants } from '~/barrels/constants';
import { enums } from '~/barrels/enums';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { BmError } from '~/models/bm-error';

let func = enums.FuncEnum.CheckViewAsDeps;

export function checkViewAsDeps(
  item: {
    views: interfaces.View[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

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

        if (referencedView.connection.name !== x.connection.name) {
          item.errors.push(
            new BmError({
              title:
                enums.ErTitleEnum
                  .DERIVED_TABLE_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION,
              message:
                `The ${api.FileExtensionEnum.View} can refer to other views ` +
                `with the same connection name. View "${x.name}" with connection ` +
                `"${x.connection.name}" references view "${referencedViewName}" ` +
                `with connection "${referencedView.connection.name}"`,
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
          } else if (field.fieldClass === api.FieldClassEnum.Filter) {
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

    if (helper.isDefined(x.derived_table)) {
      let input = x.derived_table;
      input = api.MyRegex.replaceViewRefs(input, x.name);
      input = api.MyRegex.removeBracketsOnViewFieldRefs(input);

      x.derivedTableStart = input.split('\n');
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
    }
  });

  // return zero views if at least 1 error found (no restart needed)
  newViews = item.views.length === newViews.length ? newViews : [];

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Views, newViews);

  return newViews;
}
