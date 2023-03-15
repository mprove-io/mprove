import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckViewAsDeps;

export function checkViewAsDeps(
  item: {
    views: common.FileView[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newViews: common.FileView[] = [];

  item.views.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (Object.keys(x.asDeps).length > 0) {
      Object.keys(x.asDeps).forEach(as => {
        let referencedViewName = x.asDeps[as].viewName;

        let referencedView = item.views.find(
          v => v.name === referencedViewName
        );

        if (common.isUndefined(referencedView)) {
          item.errors.push(
            new BmError({
              title: common.ErTitleEnum.DERIVED_TABLE_REFERENCES_MISSING_VIEW,
              message:
                `${common.ParameterEnum.DerivedTable} has reference to missing ` +
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

        if (
          referencedView.connection.connectionId !== x.connection.connectionId
        ) {
          item.errors.push(
            new BmError({
              title:
                common.ErTitleEnum
                  .DERIVED_TABLE_REFERENCED_VIEW_HAS_DIFFERENT_CONNECTION,
              message:
                `The ${common.FileExtensionEnum.View} can refer to other views ` +
                `with the same connection name. View "${x.name}" with connection ` +
                `"${x.connection.connectionId}" references view "${referencedViewName}" ` +
                `with connection "${referencedView.connection.connectionId}"`,
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

        if (common.isDefined(referencedView.derived_table)) {
          let input = referencedView.derived_table;

          let reg = common.MyRegex.CAPTURE_START_FIELD_TARGET_END();
          let r = reg.exec(input);

          if (r) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum
                    .DERIVED_TABLE_REFERENCED_VIEW_HAS_APPLY_FILTER,
                message:
                  `${common.ParameterEnum.DerivedTable} can not reference views that ` +
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

          if (common.isUndefined(field)) {
            item.errors.push(
              new BmError({
                title:
                  common.ErTitleEnum.DERIVED_TABLE_REFERENCES_MISSING_FIELD,
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
          } else if (field.fieldClass === common.FieldClassEnum.Filter) {
            item.errors.push(
              new BmError({
                title: common.ErTitleEnum.DERIVED_TABLE_REFERENCES_FILTER,
                message:
                  `Found referencing Filter "${fieldName}" of view "${referencedView.name}".` +
                  `${common.ParameterEnum.DerivedTable} can not reference Filter fields`,
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

    if (common.isDefined(x.derived_table)) {
      let input = x.derived_table;
      input = common.MyRegex.replaceViewRefs(input, x.name);
      input = common.MyRegex.removeBracketsOnViewFieldRefs(input);

      x.derivedTableStart = input.split('\n');
    }

    if (errorsOnStart === item.errors.length) {
      newViews.push(x);
    }
  });

  // return zero views if at least 1 error found (no restart needed)
  newViews = item.views.length === newViews.length ? newViews : [];

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Views, newViews);

  return newViews;
}
