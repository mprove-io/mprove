import { AmError } from '../../barrels/am-error';
import { ApRegex } from '../../barrels/am-regex';
import { ErrorsCollector } from '../../barrels/errors-collector';
import { enums } from '../../barrels/enums';
import { interfaces } from '../../barrels/interfaces';

export function checkCharsInRefs<
  T extends interfaces.View | interfaces.Model
>(item: { x: T; s: string; line: number }): number {
  let reg = ApRegex.CAPTURE_REFS_G();
  let r;

  let captures: string[] = [];

  while ((r = reg.exec(item.s))) {
    captures.push(r[1]);
  }

  switch (true) {
    case item.x.ext === enums.FileExtensionEnum.View: {
      let viewWrongChars: string[] = [];

      captures.forEach(cap => {
        let reg2 = ApRegex.CAPTURE_NOT_ALLOWED_VIEW_REF_CHARS_G();
        let r2;

        while ((r2 = reg2.exec(cap))) {
          viewWrongChars.push(r2[1]);
        }
      });

      let viewWrongCharsString: string = '';

      if (viewWrongChars.length > 0) {
        viewWrongCharsString = [...new Set(viewWrongChars)].join(', '); // unique

        // error e42
        ErrorsCollector.addError(
          new AmError({
            title: `wrong chars in view refs`,
            message: `characters "${viewWrongCharsString}" can not be used inside \${} of view`,
            lines: [
              {
                line: item.line,
                name: item.x.file,
                path: item.x.path
              }
            ]
          })
        );
        return;
      }
      break;
    }

    case item.x.ext === enums.FileExtensionEnum.Model: {
      let modelWrongChars: string[] = [];

      captures.forEach(cap => {
        let reg3 = ApRegex.CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G();
        let r3;

        while ((r3 = reg3.exec(cap))) {
          modelWrongChars.push(r3[1]);
        }
      });

      let modelWrongCharsString: string = '';

      if (modelWrongChars.length > 0) {
        modelWrongCharsString = [...new Set(modelWrongChars)].join(', '); // unique

        // error e43
        ErrorsCollector.addError(
          new AmError({
            title: `wrong chars in model refs`,
            message: `characters "${modelWrongCharsString}" can not be used inside \${} of model`,
            lines: [
              {
                line: item.line,
                name: item.x.file,
                path: item.x.path
              }
            ]
          })
        );
        return;
      }
      break;
    }
  }
  return 1;
}
