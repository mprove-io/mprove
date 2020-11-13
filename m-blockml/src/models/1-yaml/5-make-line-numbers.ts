import { interfaces } from '../../barrels/interfaces';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { helper } from '../../barrels/helper';
import { enums } from '../../barrels/enums';
import { BmError } from '../bm-error';

let func = enums.FuncEnum.MakeLineNumbers;

export function makeLineNumbers(item: {
  filesAny: any[];
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}): any[] {
  let { caller, structId } = item;
  helper.log(caller, func, structId, enums.LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.map(element => {
    let errorsOnStart = item.errors.length;
    processLineNumbersRecursive({
      hash: element,
      fileName: element.name,
      filePath: element.path,
      errors: item.errors
    });
    let errorsOnEnd = item.errors.length;
    if (errorsOnStart === errorsOnEnd) {
      newFilesAny.push(element);
    }
  });

  helper.log(caller, func, structId, enums.LogTypeEnum.FilesAny, newFilesAny);
  helper.log(caller, func, structId, enums.LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}

export function processLineNumbersRecursive(item: {
  hash: any;
  fileName: string;
  filePath: string;
  errors: BmError[];
}): any[] {
  Object.keys(item.hash).forEach(oldPar => {
    let reg = api.MyRegex.CAPTURE_BETWEEN_LINE_NUM();
    let r = reg.exec(oldPar);

    let lineNumber: number = r ? Number(r[1]) : 0;

    let npReg = api.MyRegex.BETWEEN_LINE_NUM_G();
    let newPar = oldPar.replace(npReg, '');

    if (
      typeof item.hash[oldPar] === 'undefined' ||
      item.hash[oldPar] === null
    ) {
      item.errors.push(
        new BmError({
          title: enums.ErTitleEnum.UNDEFINED_VALUE,
          message:
            'if parameters are specified, they can not have undefined values',
          lines: [
            {
              line: lineNumber,
              name: item.fileName,
              path: item.filePath
            }
          ]
        })
      );

      delete item.hash[oldPar];
      return;
    }

    // TODO: check logic LINE_NUMBERS
    if (oldPar !== newPar) {
      item.hash[newPar] = item.hash[oldPar];

      if (helper.isUndefined(item.hash[newPar + constants.LINE_NUMBERS])) {
        item.hash[newPar + constants.LINE_NUMBERS] = [];
      }

      item.hash[newPar + constants.LINE_NUMBERS].push(lineNumber);

      delete item.hash[oldPar];
    }

    // array
    if (Array.isArray(item.hash[newPar])) {
      item.hash[newPar].forEach((element: any, i: number, a: any[]) => {
        if (element === null) {
          // error e279
          item.errors.push(
            new BmError({
              title: enums.ErTitleEnum.ARRAY_ELEMENT_IS_NULL,
              message: 'array element can not be empty',
              lines: [
                {
                  line: lineNumber,
                  name: item.fileName,
                  path: item.filePath
                }
              ]
            })
          );

          delete item.hash[oldPar];
          return;
        }

        // hash
        if (helper.isDefined(element) && element.constructor === Object) {
          element = processLineNumbersRecursive({
            hash: element,
            fileName: item.fileName,
            filePath: item.filePath,
            errors: item.errors
          });
        } else if (Array.isArray(element)) {
          // !hash && !array - convert to string
        } else {
          // cut "_line_num___12345___line_num_" from parameter's value globally
          let eReg = api.MyRegex.BETWEEN_LINE_NUM_G();
          element = element.toString().replace(eReg, '');

          // remove whitespaces
          let reg2 = api.MyRegex.CAPTURE_WITHOUT_EDGE_WHITESPACES();
          let r2 = reg2.exec(element);
          element = r2 ? r2[1] : element;

          a[i] = element;
        }
      });

      // hash
    } else if (
      !!item.hash[newPar] &&
      item.hash[newPar].constructor === Object
    ) {
      item.hash[newPar] = processLineNumbersRecursive({
        hash: item.hash[newPar],
        fileName: item.fileName,
        filePath: item.filePath,
        errors: item.errors
      });

      // !hash && !array - convert to string
    } else {
      // cut "_line_num___12345___line_num_" from parameter's value globally
      let npReg2 = api.MyRegex.BETWEEN_LINE_NUM_G();
      item.hash[newPar] = item.hash[newPar].toString().replace(npReg2, '');
      // remove whitespaces
      let reg3 = api.MyRegex.CAPTURE_WITHOUT_EDGE_WHITESPACES();
      let r3 = reg3.exec(item.hash[newPar]);
      item.hash[newPar] = r3 ? r3[1] : item.hash[newPar];
    }
  });

  Object.keys(item.hash).forEach(par => {
    let reg = api.MyRegex.CAPTURE_WITHOUT_END_LINE_NUMBERS();
    let r = reg.exec(par);

    if (r) {
      let p = r[1];

      if (item.hash[par].length > 1) {
        let lines: interfaces.BmErrorCLine[] = item.hash[par].map(
          (l: number) => ({
            line: l,
            name: item.fileName,
            path: item.filePath
          })
        );

        item.errors.push(
          new BmError({
            title: enums.ErTitleEnum.DUPLICATE_PARAMETERS,
            message: `found duplicate "${p}:" parameters`,
            lines: lines
          })
        );

        delete item.hash[par];
        delete item.hash[p];
      } else {
        item.hash[p + constants.LINE_NUM] = item.hash[par][0];
        delete item.hash[par];
      }
    }
  });

  return item.hash;
}
