import { ConfigService } from '@nestjs/config';
import { api } from '~blockml/barrels/api';
import { constants } from '~blockml/barrels/constants';
import { enums } from '~blockml/barrels/enums';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { BmError } from '~blockml/models/bm-error';

let func = enums.FuncEnum.CheckJoinHideShowFields;

export function checkJoinHideShowFields(
  item: {
    models: interfaces.Model[];
    errors: BmError[];
    structId: string;
    caller: enums.CallerEnum;
  },
  cs: ConfigService
) {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Input, item);

  let newModels: interfaces.Model[] = [];

  item.models.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.joins.forEach(join => {
      let hideFieldsErrorLine = {
        line: join[enums.ParameterEnum.HideFields + constants.LINE_NUM],
        name: x.fileName,
        path: x.filePath
      };

      let showFieldsErrorLine = {
        line: join[enums.ParameterEnum.ShowFields + constants.LINE_NUM],
        name: x.fileName,
        path: x.filePath
      };

      if (
        helper.isDefined(join[enums.ParameterEnum.HideFields]) &&
        helper.isDefined(join[enums.ParameterEnum.ShowFields])
      ) {
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.JOIN_HIDE_AND_SHOW_FIELDS,
            message:
              `parameters "${enums.ParameterEnum.ShowFields}" ` +
              `and "${enums.ParameterEnum.HideFields}" can not be specified at the same time`,
            lines: [hideFieldsErrorLine, showFieldsErrorLine]
          })
        );
        return;
      }

      if (helper.isDefined(join[enums.ParameterEnum.HideFields])) {
        join[enums.ParameterEnum.HideFields]
          .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(asFieldName => {
            let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(asFieldName);

            if (helper.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
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
                    enums.ErTitleEnum.JOIN_HIDE_FIELDS_ELEMENT_HAS_WRONG_ALIAS,
                  message:
                    `"${asFieldName}" alias "${asName}" must match` +
                    `join "${enums.ParameterEnum.As}" parameter value`,
                  lines: [hideFieldsErrorLine]
                })
              );
              return;
            }

            let viewField = join.view.fields.find(
              vField => vField.name === fieldName
            );

            if (helper.isDefined(viewField)) {
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
                      enums.ErTitleEnum
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

      if (helper.isDefined(join[enums.ParameterEnum.ShowFields])) {
        join[enums.ParameterEnum.ShowFields]
          .filter(k => !k.match(api.MyRegex.ENDS_WITH_LINE_NUM()))
          .forEach(asFieldName => {
            let reg = api.MyRegex.CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();
            let r = reg.exec(asFieldName);

            if (helper.isUndefined(r)) {
              item.errors.push(
                new BmError({
                  title:
                    enums.ErTitleEnum
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
                    enums.ErTitleEnum.JOIN_SHOW_FIELDS_ELEMENT_HAS_WRONG_ALIAS,
                  message:
                    `"${asFieldName}" alias "${asName}" must match` +
                    `join "${enums.ParameterEnum.As}" parameter value`,
                  lines: [showFieldsErrorLine]
                })
              );
              return;
            }

            let viewField = join.view.fields.find(
              vField => vField.name === fieldName
            );

            if (helper.isDefined(viewField)) {
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
                      enums.ErTitleEnum
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

  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(cs, caller, func, structId, enums.LogTypeEnum.Models, newModels);

  return newModels;
}
