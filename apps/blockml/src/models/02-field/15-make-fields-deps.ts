import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { types } from '~blockml/barrels/types';
import { BmError } from '~blockml/models/bm-error';

let func = common.FuncEnum.MakeFieldsDeps;

export function makeFieldsDeps<T extends types.vmType>(
  item: {
    entities: T[];
    errors: BmError[];
    structId: string;
    caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
): T[] {
  let { caller, structId } = item;
  helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    if (x.fileExt === common.FileExtensionEnum.Dashboard) {
      newEntities.push(x);
      return;
    }

    x.fieldsDeps = {};

    x.fields.forEach(field => {
      x.fieldsDeps[field.name] = {};
      if (
        field.fieldClass !== common.FieldClassEnum.Filter &&
        common.isDefined(field.sql)
      ) {
        if (
          !checkCharsInFieldRefs({
            errors: item.errors,
            fileVM: x,
            value: field.sql,
            lineNum: field.sql_line_num
          })
        ) {
          return;
        }

        let reg = common.MyRegex.CAPTURE_SINGLE_REF_G();
        let r;

        while ((r = reg.exec(field.sql))) {
          let dep: string = r[1];

          x.fieldsDeps[field.name][dep] = field.sql_line_num;
        }
      }

      if (
        field.fieldClass === common.FieldClassEnum.Measure &&
        common.isDefined(field.sql_key)
      ) {
        if (
          !checkCharsInFieldRefs({
            errors: item.errors,
            fileVM: x,
            value: field.sql_key,
            lineNum: field.sql_key_line_num
          })
        ) {
          return;
        }

        let reg2 = common.MyRegex.CAPTURE_SINGLE_REF_G();
        let r2;

        while ((r2 = reg2.exec(field.sql_key))) {
          let dep2: string = r2[1];

          x.fieldsDeps[field.name][dep2] = field.sql_key_line_num;
        }
      }
    });

    if (errorsOnStart === item.errors.length) {
      newEntities.push(x);
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
  helper.log(
    cs,
    caller,
    func,
    structId,
    common.LogTypeEnum.Entities,
    newEntities
  );

  return newEntities;
}

export function checkCharsInFieldRefs<T extends types.vmType>(item: {
  errors: BmError[];
  fileVM: T;
  value: string;
  lineNum: number;
}): boolean {
  let reg = common.MyRegex.CAPTURE_REFS_G();
  let r;

  let captures: string[] = [];

  while ((r = reg.exec(item.value))) {
    captures.push(r[1]);
  }

  switch (item.fileVM.fileExt) {
    case common.FileExtensionEnum.View: {
      let viewWrongChars: string[] = [];

      captures.forEach(cap => {
        let reg2 = common.MyRegex.CAPTURE_NOT_ALLOWED_VIEW_REF_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(cap))) {
          viewWrongChars.push(r2[1]);
        }
      });

      let viewWrongCharsString = '';

      if (viewWrongChars.length > 0) {
        viewWrongCharsString = [...new Set(viewWrongChars)].join(', '); // unique

        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_CHARS_IN_VIEW_FIELDS_REFS,
            message: `characters "${viewWrongCharsString}" can not be used inside \${} of view (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: item.lineNum,
                name: item.fileVM.fileName,
                path: item.fileVM.filePath
              }
            ]
          })
        );
        return false;
      }
      break;
    }

    case common.FileExtensionEnum.Model: {
      let modelWrongChars: string[] = [];

      captures.forEach(cap => {
        let reg3 = common.MyRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
        let r3;

        while ((r3 = reg3.exec(cap))) {
          modelWrongChars.push(r3[1]);
        }
      });

      let modelWrongCharsString = '';

      if (modelWrongChars.length > 0) {
        modelWrongCharsString = [...new Set(modelWrongChars)].join(', '); // unique
        item.errors.push(
          new BmError({
            title: common.ErTitleEnum.WRONG_CHARS_IN_MODEL_FIELDS_REFS,
            message: `characters "${modelWrongCharsString}" can not be used inside \${} of model (only snake_case "a...z0...9_" is allowed)`,
            lines: [
              {
                line: item.lineNum,
                name: item.fileVM.fileName,
                path: item.fileVM.filePath
              }
            ]
          })
        );
        return false;
      }
      break;
    }
  }
  return true;
}
