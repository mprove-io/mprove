import { BmError } from '#blockml/classes/bm-error/bm-error';
import { LINE_NUM } from '#common/constants/top-blockml';
import { ErTitleEnum } from '#common/enums/special/er-title.enum';

export function checkSpaceValue(item: {
  file: any;
  parameter: string;
  errors: BmError[];
  isAllowDots: boolean;
}) {
  let { file, parameter, errors, isAllowDots } = item;
  let regex = isAllowDots ? /^[a-z][a-z0-9_.]*$/ : /^[a-z][a-z0-9_]*$/;

  if (!file[parameter].toString().match(regex)) {
    errors.push(
      new BmError({
        title: ErTitleEnum.WRONG_CHARS_IN_PARAMETER_VALUE,
        message: isAllowDots
          ? `parameter "${parameter}" contains wrong characters or whitespace (only "a...z0...9_." is allowed and must start with a letter)`
          : `parameter "${parameter}" contains wrong characters or whitespace (only "a...z0...9_" is allowed and must start with a letter)`,
        lines: [
          {
            line: file[parameter + LINE_NUM],
            name: file.name,
            path: file.path
          }
        ]
      })
    );
  }
}
