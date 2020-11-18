import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { BmError } from '../bm-error';
import { vmType } from './_vm-type';
import { api } from '../../barrels/api';

let func = enums.FuncEnum.MakeFieldsDeps;

export function makeFieldsDeps<T extends vmType>(item: {
  entities: Array<T>;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}): Array<T> {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newEntities: T[] = [];

  item.entities.forEach(x => {
    let errorsOnStart = item.errors.length;

    x.fieldsDeps = {};

    x.fields.forEach(field => {
      x.fieldsDeps[field.name] = {};
      if (
        field.fieldClass !== enums.FieldClassEnum.Filter &&
        helper.isDefined(field.sql)
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

        let reg = api.MyRegex.CAPTURE_SINGLE_REF_G();
        let r;

        while ((r = reg.exec(field.sql))) {
          let dep: string = r[1];

          x.fieldsDeps[field.name][dep] = field.sql_line_num;
        }
      }

      if (
        field.fieldClass === enums.FieldClassEnum.Measure &&
        helper.isDefined(field.sql_key)
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

        let reg2 = api.MyRegex.CAPTURE_SINGLE_REF_G();
        let r2;

        while ((r2 = reg2.exec(field.sql_key))) {
          let dep2: string = r2[1];

          x.fieldsDeps[field.name][dep2] = field.sql_key_line_num;
        }
      }
    });

    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newEntities.push(x);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);
  helper.log(caller, func, structId, enums.LogTypeEnum.Entities, newEntities);

  return newEntities;
}

export function checkCharsInFieldRefs<T extends vmType>(item: {
  errors: BmError[];
  fileVM: T;
  value: string;
  lineNum: number;
}): boolean {
  let reg = api.MyRegex.CAPTURE_REFS_G();
  let r;

  let captures: string[] = [];

  while ((r = reg.exec(item.value))) {
    captures.push(r[1]);
  }

  switch (item.fileVM.fileExt) {
    case api.FileExtensionEnum.View: {
      let viewWrongChars: string[] = [];

      captures.forEach(cap => {
        let reg2 = api.MyRegex.CAPTURE_NOT_ALLOWED_VIEW_REF_CHARS_G();
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
            title: enums.ErTitleEnum.WRONG_CHARS_IN_VIEW_FIELDS_REFS,
            message: `characters "${viewWrongCharsString}" can not be used inside \${} of view`,
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

    case api.FileExtensionEnum.Model: {
      let modelWrongChars: string[] = [];

      captures.forEach(cap => {
        let reg3 = api.MyRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
        let r3;

        while ((r3 = reg3.exec(cap))) {
          modelWrongChars.push(r3[1]);
        }
      });

      let modelWrongCharsString = '';

      if (modelWrongChars.length > 0) {
        modelWrongCharsString = [...new Set(modelWrongChars)].join(', '); // unique
        // TODO: test for WRONG_CHARS_IN_MODEL_FIELDS_REFS - caller
        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.WRONG_CHARS_IN_MODEL_FIELDS_REFS,
            message: `characters "${modelWrongCharsString}" can not be used inside \${} of model`,
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
