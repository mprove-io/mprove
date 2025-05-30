import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { constants } from '~blockml/barrels/constants';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.CheckJoinHideShowFields;

export function checkJoinHideShowFields(
  item: {
    models: common.FileModel[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newModels: common.FileModel[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins.forEach(join => {
      let hideFieldsErrorLine = {
        line: join[
          (common.ParameterEnum.HideFields +
            constants.LINE_NUM) as keyof common.FileJoin
        ] as number,
        name: x.fileName,
        path: x.filePath
      };

      let showFieldsErrorLine = {
        line: join[
          (common.ParameterEnum.ShowFields +
            constants.LINE_NUM) as keyof common.FileJoin
        ] as number,
        name: x.fileName,
        path: x.filePath
      };

      if (
        common.isDefined(join[common.ParameterEnum.HideFields]) &&
        common.isDefined(join[common.ParameterEnum.ShowFields])
      ) {
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.JOIN_HIDE_AND_SHOW_FIELDS,
            message:
              `parameters "${common.ParameterEnum.ShowFields}" ` +
              `and "${common.ParameterEnum.HideFields}" cannot be specified at the same time`,
            lines: [hideFieldsErrorLine, showFieldsErrorLine]
          })
        );
        return;
      }

      if (common.isDefined(join[common.ParameterEnum.HideFields])) {
        join[common.ParameterEnum.HideFields]
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(asFieldName => {
            let reg =
              common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(asFieldName);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum
                      .JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_REFERENCE,
                  message:
                    `found field reference ${asFieldName} that is not ` +
                    'in form "alias.field_name"',
                  lines: [hideFieldsErrorLine]
                })
              );
              return;
            }

            let asName = r[1];
            let fieldName = r[2];

            if (asName !== join.as) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_ALIAS,
                  message:
                    `"${asFieldName}" alias "${asName}" must match` +
                    `join "${common.ParameterEnum.As}" parameter value`,
                  lines: [hideFieldsErrorLine]
                })
              );
              return;
            }

            let viewField = join.view.fields.find(
              vField => vField.name === fieldName
            );

            if (common.isDefined(viewField)) {
              // override
              viewField.hidden = 'true';
            } else {
              let timeDimensions = join.view.fields.filter(
                vField => vField.groupId === fieldName
              );
              if (timeDimensions.length > 0) {
                timeDimensions.forEach(d => {
                  // override
                  d.hidden = 'true';
                });
              } else {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .JOIN_HIDE_FIELDS_ELEMENT_REFS_MISSING_VIEW_FIELD,
                    message:
                      `"${asFieldName}" references missing or not valid field ` +
                      `"${fieldName}" of view "${join.view.name}". ` +
                      `View has "${asName}" alias in "${x.name}" model.`,
                    lines: [hideFieldsErrorLine]
                  })
                );
                return;
              }
            }
          });
      }

      if (common.isDefined(join[common.ParameterEnum.ShowFields])) {
        join[common.ParameterEnum.ShowFields]
          .filter(k => !k.match(common.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(asFieldName => {
            let reg =
              common.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(asFieldName);

            if (common.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum
                      .JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_REFERENCE,
                  message:
                    `found field reference ${asFieldName} that is not ` +
                    'in form "alias.field_name"',
                  lines: [showFieldsErrorLine]
                })
              );
              return;
            }

            let asName = r[1];
            let fieldName = r[2];

            if (asName !== join.as) {
              item.errors.push(
                new BmError({
                  title:
                    common.ErTitleEnum.JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_ALIAS,
                  message:
                    `"${asFieldName}" alias "${asName}" must match` +
                    `join "${common.ParameterEnum.As}" parameter value`,
                  lines: [showFieldsErrorLine]
                })
              );
              return;
            }

            let viewField = join.view.fields.find(
              vField => vField.name === fieldName
            );

            if (common.isDefined(viewField)) {
              // override
              viewField.hidden = 'false';
            } else {
              let timeDimensions = join.view.fields.filter(
                vField => vField.groupId === fieldName
              );
              if (timeDimensions.length > 0) {
                timeDimensions.forEach(d => {
                  // override
                  d.hidden = 'false';
                });
              } else {
                item.errors.push(
                  new BmError({
                    title:
                      common.ErTitleEnum
                        .JOIN_SHOW_FIELDS_ELEMENT_REFS_MISSING_VIEW_FIELD,
                    message:
                      `"${asFieldName}" references missing or not valid field ` +
                      `"${fieldName}" of view "${join.view.name}". ` +
                      `View has "${asName}" alias in "${x.name}" model.`,
                    lines: [showFieldsErrorLine]
                  })
                );
                return;
              }
            }
          });
      }
    });

    if (errorsOnStart === item.errors.length) {
      newModels.push(x);
    }
  });

  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Errors,
    item.errors
  );
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Models, newModels);

  return newModels;
}
