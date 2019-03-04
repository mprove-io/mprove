import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { interfaces } from '../../barrels/interfaces';

export function processLineNumbersRecursive(item: {
  hash: any,
  fileName: string,
  filePath: string
}): any[] {

  Object.keys(item.hash).forEach(oldPar => {

    let reg = ApRegex.CAPTURE_BETWEEN_LINE_NUM();
    let r = reg.exec(oldPar);

    let lineNumber: number = r ? Number(r[1]) : 0;

    let npReg = ApRegex.BETWEEN_LINE_NUM_G();
    let newPar = oldPar.replace(npReg, '');

    if (typeof item.hash[oldPar] === 'undefined' || item.hash[oldPar] === null) {
      // error e6
      ErrorsCollector.addError(new AmError({
        title: 'undefined value',
        message: 'if parameters are specified, they can not have undefined values',
        lines: [{
          line: lineNumber,
          name: item.fileName,
          path: item.filePath,
        }]
      }));

      delete item.hash[oldPar];
      return;
    }

    if (oldPar !== newPar) {
      item.hash[newPar] = item.hash[oldPar];

      if (!item.hash[newPar + 'LineNumbers']) {
        item.hash[newPar + 'LineNumbers'] = [];
      }

      item.hash[newPar + 'LineNumbers'].push(lineNumber);

      delete item.hash[oldPar];
    }

    // array
    if (Array.isArray(item.hash[newPar])) {
      item.hash[newPar].forEach((element: any, i: number, a: any[]) => {

        if (element === null) {
          // error e279
          ErrorsCollector.addError(new AmError({
            title: 'array element is null',
            message: 'array element can not be empty',
            lines: [{
              line: lineNumber,
              name: item.fileName,
              path: item.filePath,
            }]
          }));

          delete item.hash[oldPar];
          return;
        }

        // hash
        if (!!element && element.constructor === Object) {
          element = processLineNumbersRecursive({
            hash: element,
            fileName: item.fileName,
            filePath: item.filePath
          });
          // TODO: make error - we don't support Array of Arrays
        } else if (Array.isArray(element)) {


          // !hash && !array - convert to string
        } else {
          // cut "_line_num___12345___line_num_" from parameter's value globally
          let eReg = ApRegex.BETWEEN_LINE_NUM_G();
          element = element.toString().replace(eReg, '');

          // remove whitespaces
          let reg2 = ApRegex.CAPTURE_WITHOUT_EDGE_WHITESPACES();
          let r2 = reg2.exec(element);
          element = r2 ? r2[1] : element;

          a[i] = element;
        }
      });

      // hash
    } else if (!!item.hash[newPar] && item.hash[newPar].constructor === Object) {
      item.hash[newPar] = processLineNumbersRecursive({
        hash: item.hash[newPar],
        fileName: item.fileName,
        filePath: item.filePath
      });

      // !hash && !array - convert to string
    } else {
      // cut "_line_num___12345___line_num_" from parameter's value globally
      let npReg2 = ApRegex.BETWEEN_LINE_NUM_G();
      item.hash[newPar] = item.hash[newPar].toString().replace(npReg2, '');
      // remove whitespaces
      let reg3 = ApRegex.CAPTURE_WITHOUT_EDGE_WHITESPACES();
      let r3 = reg3.exec(item.hash[newPar]);
      item.hash[newPar] = r3 ? r3[1] : item.hash[newPar];
    }

  });

  // TODO: already checked by js-yaml (no error e7 test)
  Object.keys(item.hash).forEach(par => {

    let reg = ApRegex.CAPTURE_WITHOUT_END_LINE_NUMBERS();
    let r = reg.exec(par);

    if (r) {
      let p = r[1];

      if (item.hash[par].length > 1) {

        let lines: interfaces.ErrorLine[] = item.hash[par].map((l: number) => ({
          line: l,
          name: item.fileName,
          path: item.filePath
        }));

        // error e7
        ErrorsCollector.addError(new AmError({
          title: 'duplicate parameters',
          message: `found duplicate "${p}:" parameters`,
          lines: lines,
        }));

        delete item.hash[par];
        delete item.hash[p];

      } else {
        // let parLineNum: string = p + 'LineNum';
        item.hash[p + '_line_num'] = item.hash[par][0];
        delete item.hash[par];
      }
    }
  });

  return item.hash;
}
