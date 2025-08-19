import { ConfigService } from '@nestjs/config';
import { BmError } from '~blockml/models/bm-error';

let func = FuncEnum.MakeLineNumbers;

export function makeLineNumbers(
  item: {
    filesAny: any[];
    errors: BmError[];
    structId: string;
    caller: CallerEnum;
    isSetLineNumToZero?: boolean;
  },
  cs: ConfigService<BlockmlConfig>
): any[] {
  let { caller, structId, isSetLineNumToZero } = item;
  log(cs, caller, func, structId, LogTypeEnum.Input, item);

  let newFilesAny: any[] = [];

  item.filesAny.map(element => {
    let errorsOnStart = item.errors.length;
    processLineNumbersRecursive({
      hash: element,
      fileName: element.name,
      filePath: element.path,
      errors: item.errors,
      isSetLineNumToZero: isSetLineNumToZero
    });

    if (errorsOnStart === item.errors.length) {
      newFilesAny.push(element);
    }
  });

  log(cs, caller, func, structId, LogTypeEnum.FilesAny, newFilesAny);
  log(cs, caller, func, structId, LogTypeEnum.Errors, item.errors);

  return newFilesAny;
}

export function processLineNumbersRecursive(item: {
  hash: any;
  fileName: string;
  filePath: string;
  errors: BmError[];
  isSetLineNumToZero: boolean;
}): any[] {
  let { isSetLineNumToZero } = item;

  Object.keys(item.hash).forEach(oldPar => {
    let reg = MyRegex.CAPTURE_BETWEEN_LINE_NUM();
    let r = reg.exec(oldPar);

    let lineNumber: number =
      isSetLineNumToZero === true ? 0 : r ? Number(r[1]) : 0;

    let npReg = MyRegex.BETWEEN_LINE_NUM_G();
    let newPar = oldPar.replace(npReg, '');

    if (isUndefined(item.hash[oldPar])) {
      item.errors.push(
        new BmError({
          title: ErTitleEnum.UNDEFINED_VALUE,
          message:
            'if parameters are specified, they cannot have undefined values',
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

    if (oldPar !== newPar) {
      item.hash[newPar] = item.hash[oldPar];

      if (isUndefined(item.hash[newPar + LINE_NUMBERS])) {
        item.hash[newPar + LINE_NUMBERS] = [];
      }

      item.hash[newPar + LINE_NUMBERS].push(lineNumber);

      delete item.hash[oldPar];
    }

    // array
    if (Array.isArray(item.hash[newPar])) {
      item.hash[newPar].forEach((element: any, i: number, a: any[]) => {
        if (element === null) {
          item.errors.push(
            new BmError({
              title: ErTitleEnum.ARRAY_ELEMENT_IS_NULL,
              message: 'array element cannot be empty',
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
        if (element?.constructor === Object) {
          element = processLineNumbersRecursive({
            hash: element,
            fileName: item.fileName,
            filePath: item.filePath,
            errors: item.errors,
            isSetLineNumToZero: isSetLineNumToZero
          });
        } else if (Array.isArray(element)) {
          // !hash && !array - convert to string
        } else {
          // cut "_line_num___12345___line_num_" from parameter's value globally
          let eReg = MyRegex.BETWEEN_LINE_NUM_G();
          element = element.toString().replace(eReg, '');

          // remove whitespaces
          let reg2 = MyRegex.CAPTURE_WITHOUT_EDGE_WHITESPACES();
          let r2 = reg2.exec(element);
          element = r2 ? r2[1] : element;

          a[i] = element;
        }
      });

      // hash
    } else if (item.hash[newPar]?.constructor === Object) {
      item.hash[newPar] = processLineNumbersRecursive({
        hash: item.hash[newPar],
        fileName: item.fileName,
        filePath: item.filePath,
        errors: item.errors,
        isSetLineNumToZero: isSetLineNumToZero
      });

      // !hash && !array - convert to string
    } else {
      // cut "_line_num___12345___line_num_" from parameter's value globally
      let npReg2 = MyRegex.BETWEEN_LINE_NUM_G();
      item.hash[newPar] = item.hash[newPar].toString().replace(npReg2, '');
      // remove whitespaces
      let reg3 =
        [
          ParameterEnum.CurrencyPrefix.toString(),
          ParameterEnum.CurrencySuffix.toString(),
          ParameterEnum.ThousandsSeparator.toString()
        ].indexOf(newPar) > -1
          ? MyRegex.CAPTURE_WITH_EDGE_WHITESPACES()
          : MyRegex.CAPTURE_WITHOUT_EDGE_WHITESPACES();
      let r3 = reg3.exec(item.hash[newPar]);
      item.hash[newPar] = r3 ? r3[1] : item.hash[newPar];
    }
  });

  Object.keys(item.hash).forEach(par => {
    let reg = MyRegex.CAPTURE_WITHOUT_END_LINE_NUMBERS();
    let r = reg.exec(par);

    if (r) {
      let p = r[1];

      if (item.hash[par].length > 1) {
        let lines: FileErrorLine[] = item.hash[par].map((l: number) => ({
          line: l,
          name: item.fileName,
          path: item.filePath
        }));

        item.errors.push(
          new BmError({
            title: ErTitleEnum.DUPLICATE_PARAMETERS,
            message: `found duplicate "${p}:" parameters`,
            lines: lines
          })
        );

        delete item.hash[par];
        delete item.hash[p];
      } else {
        item.hash[p + LINE_NUM] = item.hash[par][0];
        delete item.hash[par];
      }
    }
  });

  return item.hash;
}
