import { constants } from '~common/barrels/constants';
import { cloneRegexp } from '~common/functions/clone-regexp';

export class MyRegex {
  // COMMON

  static replaceSpacesWithUnderscores(input: string): string {
    return input.split(' ').join('_');
  }

  static IGNORED_FILE_NAMES(): RegExp {
    return cloneRegexp(/^(?:\.git|\.svn|\.hg|\.DS_Store)$/);
  }

  static ENDS_WITH_MD(): RegExp {
    return cloneRegexp(/[.]md$/);
  }

  static CAPTURE_EXT(): RegExp {
    return cloneRegexp(/([.][\s\S]+)$/);
  }

  static CONTAINS_DOT(): RegExp {
    return cloneRegexp(/[.]+/);
  }

  // DISK

  static CAPTURE_FILE_NAME_BEFORE_EXT(): RegExp {
    return cloneRegexp(/([\s\S]+)[.][\s\S]+$/);
  }

  static PROJECT_NAME_CONTAINS_WRONG_CHARS(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }

  static PROJECT_NAME_DOES_NOT_START_WITH_LETTER(): RegExp {
    return cloneRegexp(/(^[0-9_])/g);
  }

  static CAPTURE_ALIAS(): RegExp {
    return cloneRegexp(/([^@]*)@/);
  }

  static CONTAINS_CONFLICT_START(): RegExp {
    return cloneRegexp(/^<<<<<<</);
  }

  static CAPTURE_MPROVE_MODELS(): RegExp {
    return cloneRegexp(
      /(?<=^|\n)#\(mprove\)\s+.*\bmodel\b.*\n(?:.*\n)*?\s*source:\s+(\w+)\s+is/g
    );
  }

  // BLOCKML

  static MALLOY_QUERY_SOURCE(tileQueryName: string): RegExp {
    // tool
    // query:\s*(mc3)\s+is\s*([\s\S]*?)(?=(?:\nquery:\s*\w+\sis|source:\s|\nrun:\s|\nimport\s*{|\nimport\s*'|\nimport\s*"|$))

    return cloneRegexp(
      new RegExp(
        [
          `query:`,
          `\\s*`,
          `(${tileQueryName})`,
          `\\s+`,
          `is`,
          `\\s+`,
          `(\\w+)`,
          `\\s+`,
          `([\\s\\S]*?)`,
          `(?=`,
          `(?:`,
          `\\nquery:\\s*\\w+\\sis`,
          `|source:\\s`,
          `|\\nrun:\\s`,
          `|\\nimport\\s*\\{`,
          `|\\nimport\\s*\\'`,
          `|\\nimport\\s*\\"`,
          `|$`,
          `)`,
          `)`
        ].join(''),
        'g'
      )
    );
  }

  static replaceUnderscoresWithSpaces(input: string): string {
    return input.split('_').join(' ');
  }

  static CONTAINS_BLOCKML_REF(): RegExp {
    return cloneRegexp(/\$\{.+\}/);
  }

  static FIVE_ELEMENTS_SEPARATED_BY_SPACES(): RegExp {
    return cloneRegexp(/^\S+\s+\S+\s+\S+\s+\S+\s+\S+$/);
  }
  static ENDS_WITH_IML(): RegExp {
    return cloneRegexp(/[.]iml$/);
  }
  static GIT_FOLDER(): RegExp {
    return cloneRegexp(/[.]git/);
  }
  static IDEA_FOLDER(): RegExp {
    return cloneRegexp(/[.]idea/);
  }
  static COMMENTS_G(): RegExp {
    return cloneRegexp(/[#][\s\S]*/g);
  }
  static CAPTURE_PARAMETER_AND_VALUE(): RegExp {
    return cloneRegexp(/([^:]*):([^\n]*)/);
  }
  static CAPTURE_BETWEEN_LINE_NUM(): RegExp {
    return cloneRegexp(/_line_num___(.+?)___line_num_/);
  }
  static BETWEEN_LINE_NUM_G(): RegExp {
    return cloneRegexp(/_line_num___.+?___line_num_/g);
  }
  static CAPTURE_WITH_EDGE_WHITESPACES(): RegExp {
    return cloneRegexp(/^([\s\S]+?)$/);
  }
  static CAPTURE_WITHOUT_EDGE_WHITESPACES(): RegExp {
    return cloneRegexp(/^\s*([\s\S]+?)\s*$/);
  }
  static CAPTURE_WITHOUT_END_LINE_NUMBERS(): RegExp {
    return cloneRegexp(/([\s\S]+?)LineNumbers$/);
  }
  static ENDS_WITH_LINE_NUM(): RegExp {
    return cloneRegexp(/_line_num$/);
  }
  static TRUE_FALSE(): RegExp {
    return cloneRegexp(/^(?:true|false)$/);
  }
  static TRUE(): RegExp {
    return cloneRegexp(/^true$/);
  }
  static FALSE(): RegExp {
    return cloneRegexp(/^false$/);
  }
  static FIELD_DECLARATION_G(): RegExp {
    return cloneRegexp(/^(?:dimension|time|measure|calculation|filter)$/g);
  }
  static DIGITS_1_TO_99_G(): RegExp {
    return cloneRegexp(/^([123456789]\d?)$/g);
  }
  static CAPTURE_DIGITS_G(): RegExp {
    return cloneRegexp(/(\d+)/g);
  }
  static CAPTURE_DIGITS_START_TO_END_G(): RegExp {
    return cloneRegexp(/^(\d+)$/g);
  }
  static CAPTURE_MINUS_DIGITS_START_TO_END_G(): RegExp {
    return cloneRegexp(/^([-]?\d+)$/g);
  }
  // static CAPTURE_RGB_G(): RegExp {
  //   return cloneRegexp(/^((?:rgb)\(\d+\,\s?\d+\,\s?\d+\))$/g);
  // }
  // static CAPTURE_RGBA_G(): RegExp {
  //   return cloneRegexp(
  //     /^((?:rgba)\(\d+\,\s?\d+\,\s?\d+\,\s?\d+(?:[.]\d+)?\))$/g
  //   );
  // }
  static CAPTURE_RGB_SPLIT_G(): RegExp {
    return cloneRegexp(/^((?:rgb)\((\d+)\,\s?(\d+)\,\s?(\d+)\))$/g);
  }
  static CAPTURE_RGBA_SPLIT_G(): RegExp {
    return cloneRegexp(
      /^((?:rgba)\((\d+)\,\s?(\d+)\,\s?(\d+)\,\s?(\d+(?:[.]\d+)?)\))$/g
    );
  }

  static CAPTURE_FLOAT_START_TO_END_G(): RegExp {
    return cloneRegexp(/^(\d+[.]\d+)$/g);
  }
  static CAPTURE_REFS_G(): RegExp {
    return cloneRegexp(/\$\{([^}]+)\}/g);
  }
  static CAPTURE_NOT_ALLOWED_FILE_DECLARATION_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-zA-Z0-9_])/g); // A-Z for generated names
  }
  static CAPTURE_NOT_SNAKE_CASE_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_VIEW_REF_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_ENV_VAR_CHARS_G(): RegExp {
    return cloneRegexp(/([^A-Z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_CONNECTION_NAME_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_ALIAS_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_FIELD_TIME_GROUP_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_GROUP_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_TIME_NAME_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_RESULT_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_CONTROL_NAME_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_FIELD_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_])/g);
  }
  static CAPTURE_NOT_ALLOWED_MODEL_REF_CHARS_G(): RegExp {
    return cloneRegexp(/([^a-z0-9_.])/g);
  }
  static CAPTURE_SINGLE_REF(): RegExp {
    return cloneRegexp(/\$\{(\w+?)\}/);
  }
  static CAPTURE_SINGLE_REF_G(): RegExp {
    return cloneRegexp(/\$\{(\w+?)\}/g);
  }
  static CAPTURE_ENV_REF(): RegExp {
    return cloneRegexp(/\$\{env\.(\w+)\}/);
  }
  static CAPTURE_ENV_REF_G(): RegExp {
    return cloneRegexp(/\$\{env\.(\w+)\}/g);
  }
  static CAPTURE_ROW_REF(): RegExp {
    return cloneRegexp(/\$([A-Z0-9]+)/);
  }
  static CAPTURE_X_REF(): RegExp {
    return cloneRegexp(/\$([A-Z0-9_]+)/);
  }
  static CAPTURE_X_REF_G(): RegExp {
    return cloneRegexp(/\$([A-Z0-9_]+)/g);
  }
  static CAPTURE_S_REF(): RegExp {
    return cloneRegexp(/\$([A-Z0-9_]+)/);
  }
  static CAPTURE_S_REF_G(): RegExp {
    return cloneRegexp(/\$([A-Z0-9_]+)/g);
  }
  static WORD_CHARACTERS(): RegExp {
    return cloneRegexp(/^(?:\w+)$/);
  }
  static CAPTURE_START_FIELD_TARGET_END(): RegExp {
    return cloneRegexp(
      /([\s\S]*)\{\%\s*apply_filter\s*(\w+)\s*\%\}\s?([\s\S]+?)\s?\{\%\s*end_apply_filter\s*\%\}([\s\S]*)/
    );
  }
  static CAPTURE_DOUBLE_REF_G(): RegExp {
    return cloneRegexp(/\$\{(\w+)[.](\w+)\}/g);
  }

  // static CAPTURE_PDT_TABLE_ID(): RegExp {
  //   return cloneRegexp(/\$\{(\w+)[.]PDT_TABLE_ID\}/g);
  // }

  // static CAPTURE_PDT_TABLE_REF(): RegExp {
  //   return cloneRegexp(/\$\{(\w+)[.]PDT_TABLE_REF\}/g);
  // }

  static CAPTURE_VIEW_REF_G(): RegExp {
    return cloneRegexp(/\$\{(\w+)\s+[Aa][Ss]\s+(\w+)\}/g);
  }

  static CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_G(): RegExp {
    return cloneRegexp(/^\s*(\w+)[.](\w+)\s*$/g);
  }

  static CAPTURE_DOUBLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G(): RegExp {
    return cloneRegexp(/^\s*(\w+)[.](\w+)\s*$/g);
  }
  static CAPTURE_WORD_BETWEEN_WHITESPACES(): RegExp {
    return cloneRegexp(/^\s*(\w+)\s*$/);
  }
  static CAPTURE_TRIPLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G(): RegExp {
    return cloneRegexp(/^\s*(\w+)[.](\w+)[.](\w+)\s*$/g);
  }

  static CAPTURE_SORT_WITH_OPTIONAL_DESC_G(): RegExp {
    return cloneRegexp(/^\s*(\w+(?:\.\w+)*)\s*(desc)?\s*$/g);
  }

  static CAPTURE_STORE_SORT_WITH_OPTIONAL_DESC_G(): RegExp {
    return cloneRegexp(/^\s*(\w+)\s*(desc)?\s*$/g);
  }

  static TIMESTAMP_START_END(): RegExp {
    return cloneRegexp(
      /([\s\S]*)mprovetimestampstart([\s\S]*?)mprovetimestampend([\s\S]*)/
    );
  }

  static APPLY_FILTER(): RegExp {
    return cloneRegexp(
      /^([\s\S]*)\{\%\s*apply_filter\s*(\w+)\s*\%\}\s?(.+?)\s?\{\%\s*end_apply_filter\s*\%\}([\s\S]*)$/
    );
  }

  // BRICK
  static BRICK_IS_NULL(): RegExp {
    return cloneRegexp(/^(not\s+)?(null)$/g);
  }
  static BRICK_IS_ANY_VALUE(): RegExp {
    return cloneRegexp(/^any$/g);
  }

  // BRICK_NUMBER
  static BRICK_NUMBER_NOT_AND_DIGITS(): RegExp {
    return cloneRegexp(
      /^(not\s+)?(?:[-]?\d+(?:[.]\d+)?)(?:\s*,\s*[-]?\d+(?:[.]\d+)?)*$/g
    );
  }
  static BRICK_NUMBER_EQUAL_TO(): RegExp {
    return cloneRegexp(/\s*([-]?\d+(?:[.]\d+)?)\s*$/g); // without ^, can contain 'not'
  }

  static BRICK_NUMBER_IS_GREATER_THAN_OR_EQUAL_TO(): RegExp {
    return cloneRegexp(/^>=\s*([-]?\d+(?:\.\d+)?)$/g);
  }
  static BRICK_NUMBER_IS_GREATER_THAN(): RegExp {
    return cloneRegexp(/^>\s*([-]?\d+(?:\.\d+)?)$/g);
  }
  static BRICK_NUMBER_IS_LESS_THAN_OR_EQUAL_TO(): RegExp {
    return cloneRegexp(/^<=\s*([-]?\d+(?:\.\d+)?)$/g);
  }
  static BRICK_NUMBER_IS_LESS_THAN(): RegExp {
    return cloneRegexp(/^<\s*([-]?\d+(?:\.\d+)?)$/g);
  }
  static BRICK_NUMBER_IS_BETWEEN_INCLUSIVE(): RegExp {
    return cloneRegexp(
      /^(not\s+)?\[\s*([-]?\d+(?:\.\d+)?)\s*,\s*([-]?\d+(?:\.\d+)?)\s*\]/g
    );
  }
  static BRICK_NUMBER_IS_BETWEEN_LEFT_INCLUSIVE(): RegExp {
    return cloneRegexp(
      /^(not\s+)?\[\s*([-]?\d+(?:\.\d+)?)\s*,\s*([-]?\d+(?:\.\d+)?)\s*\)/g
    );
  }
  static BRICK_NUMBER_IS_BETWEEN_RIGHT_INCLUSIVE(): RegExp {
    return cloneRegexp(
      /^(not\s+)?\(\s*([-]?\d+(?:\.\d+)?)\s*,\s*([-]?\d+(?:\.\d+)?)\s*\]/g
    );
  }
  static BRICK_NUMBER_IS_BETWEEN_EXCLUSIVE(): RegExp {
    return cloneRegexp(
      /^(not\s+)?\(\s*([-]?\d+(?:\.\d+)?)\s*,\s*([-]?\d+(?:\.\d+)?)\s*\)/g
    );
  }

  // BRICK_STRING
  static BRICK_STRING_IS_EQUAL_TO(): RegExp {
    return cloneRegexp(/^(not\s+)?-(.+)-$/g);
  }
  static BRICK_STRING_CONTAINS(): RegExp {
    return cloneRegexp(/^(not\s+)?%(.+)%$/g);
  }
  static BRICK_STRING_STARTS_WITH(): RegExp {
    return cloneRegexp(/^(.+)%(\s+not)?$/g);
  }
  static BRICK_STRING_ENDS_WITH(): RegExp {
    return cloneRegexp(/^(not\s+)?%(.+)$/g);
  }
  static BRICK_STRING_IS_BLANK(): RegExp {
    return cloneRegexp(/^(not\s+)?(blank)$/g);
  }

  // BRICK_YESNO
  static BRICK_YESNO_IS_YES(): RegExp {
    return cloneRegexp(/^yes$/g);
  }
  static BRICK_YESNO_IS_NO(): RegExp {
    return cloneRegexp(/^no$/g);
  }

  // BRICK_TS
  static BRICK_TS_LITERAL(): RegExp {
    return cloneRegexp(
      new RegExp(
        [
          '^',
          '(?:(\\d{4})', // year
          '(?:-(\\d{2})', // month
          '(?:-(\\d{2})', // day
          '(?:(?:\\s|[T])(\\d{2})', // hour
          '(?::(\\d{2})', // minute
          '?)?)?)?)?)' //
        ].join('')
      )
    );
  }

  static BRICK_TS_INTERVALS(): RegExp {
    return cloneRegexp(
      new RegExp(
        [
          '^(last|before|after)', // way
          '(?:\\s+(?:(\\d+)', // integer
          '\\s+(minutes|hours|days|weeks|months|quarters|years))', // unit
          '|(?:\\s+(\\d\\d\\d\\d)', // year
          '(?:\\/(\\d\\d)', // month
          '(?:\\/(\\d\\d)', // day
          '(?:\\s+(\\d\\d)', // hour
          '(?::(\\d\\d)', // minute
          '?)?)?)?)?))', //
          '(?:\\s+(complete))?', // complete
          '(?:\\s+(ago|in\\s*future))?', // when
          '(?:\\s+(plus\\s*current))?', // plus_current
          '(?:\\s+for\\s+(\\d+)\\s+', // for_integer
          '(minutes|hours|days|weeks|months|quarters|years))?', // for_unit
          '$' //
        ].join('')
      )
    );
  }

  static BRICK_TS_IS_BETWEEN_ON(): RegExp {
    return cloneRegexp(
      new RegExp(
        [
          '^on\\s+', //
          '(\\d\\d\\d\\d)', // year
          '(?:\\/(\\d\\d)', // month
          '(?:\\/(\\d\\d)', // day
          '(?:\\s+(\\d\\d)', // hour
          '(?::(\\d\\d)', // minute
          '?)?)?)?)?', //
          '(?:\\s+to\\s+', //
          '(\\d\\d\\d\\d)', // to_year
          '(?:\\/(\\d\\d)', // to_month
          '(?:\\/(\\d\\d)', // to_day
          '(?:\\s+(\\d\\d)', // to_hour
          '(?::(\\d\\d)', // to_minute
          '?)?)?)?)?)?$' //
        ].join('')
      )
    );
  }

  // BRICK_DAY_OF_WEEK
  static BRICK_DAY_OF_WEEK_IS(): RegExp {
    return cloneRegexp(
      new RegExp(
        [
          '^(not\\s+)?',
          '(monday',
          '|tuesday',
          '|wednesday',
          '|thursday',
          '|friday',
          '|saturday',
          '|sunday)$'
        ].join(''),
        'i'
      )
    );
  }

  // BRICK_DAY_OF_WEEK_INDEX
  static BRICK_DAY_OF_WEEK_INDEX_IS_EQUAL(): RegExp {
    return cloneRegexp(/^(not\s+)?(?:[1-7](\s*,\s*[1-7])*)$/);
  }
  static BRICK_DAY_OF_WEEK_INDEX_EQUAL_TO(): RegExp {
    return cloneRegexp(/\s*([1-7])\s*$/); // without ^, can contain 'not'
  }

  // BRICK_MONTH_NAME
  static BRICK_MONTH_NAME_IS(): RegExp {
    return cloneRegexp(
      new RegExp(
        [
          '^(not\\s+)?',
          '(january',
          '|february',
          '|march',
          '|april',
          '|may',
          '|june',
          '|july',
          '|august',
          '|september',
          '|october',
          '|november',
          '|december)$'
        ].join(''),
        'i'
      )
    );
  }

  // BRICK_QUARTER_OF_YEAR
  static BRICK_QUARTER_OF_YEAR_IS(): RegExp {
    return cloneRegexp(/^(not\s+)?(q1|q2|q3|q4)$/);
  }

  static replaceSingleRefs(input: string, ref: string, val: string): string {
    // does not handle special characters
    // let reg = new RegExp(`\\$\\{${ref}\\}`, 'g');
    // return input.replace(reg, `(${val})`);

    return input.split(`\$\{${ref}\}`).join(`(${val})`);
  }

  static replaceEnvRefs(input: string, ref: string, val: string): string {
    return input.split(`\$\{env.${ref}\}`).join(`${val}`);
  }

  static replaceRowIds(input: string, ref: string, val: string): string {
    return input.split(`\$${ref}`).join(`\$${constants.QUAD_UNDERSCORE}${val}`);
  }

  static replaceRowIdsFinalAddPars(
    input: string,
    ref: string,
    val: string
  ): string {
    // const regex = new RegExp(`\\$${ref}(?![A-Z_])`);
    // return input.replace(regex, `(${val})`);
    return input.split(`\$${ref}`).join(`(${val})`);
  }

  static replaceRowIdsFinalNoPars(
    input: string,
    ref: string,
    val: string
  ): string {
    // const regex = new RegExp(`\\$${ref}(?![A-Z_])`);
    // return input.replace(regex, val);
    return input.split(`\$${ref}`).join(`${val}`);
  }

  static replaceXRefs(input: string, ref: string, val: string): string {
    // const regex = new RegExp(`\\$${ref}(?![A-Z_])`);
    // return input.replace(regex, val);
    return input.split(`\$${ref}`).join(`${val}`);
  }

  static replaceSRefs(input: string, ref: string, val: string): string {
    // const regex = new RegExp(`\\$${ref}(?![A-Z_])`);
    // return input.replace(regex, val);
    return input.split(`\$${ref}`).join(`${val}`);
  }

  // static replacePdtTableId(input: string, ref: string, val: string): string {
  //   return input.split(`\$\{${ref}.PDT_TABLE_ID\}`).join(`${val}`);
  // }

  // static replacePdtTableRef(input: string, ref: string, val: string): string {
  //   return input.split(`\$\{${ref}.PDT_TABLE_REF\}`).join(`${val}`);
  // }

  static replaceAndConvert(
    input: string,
    depValue: string,
    asName: string,
    depName: string
  ): string {
    let reg = new RegExp('\\$\\{(\\w+?)\\}', 'g');

    let ins = depValue.replace(reg, `\$\{${asName}.$1\}`);

    let reg2 = new RegExp(`\\$\\{${asName}[.]${depName}\\}`, 'g');

    return input.replace(reg2, `(${ins})`);
  }

  static replaceMproveFilter(input: string, target: string): string {
    let reg1 = new RegExp('^\\s*([\\s\\S]*)');

    input = input.replace(reg1, '$1');

    let reg2 = new RegExp('mproveFilter', 'g');

    return input.replace(reg2, `${target}`);
  }

  static removeLastN(input: string): string {
    let reg = new RegExp('^([\\s\\S]*)\\n$', 'g');

    return input.replace(reg, '$1');
  }

  static removeBracketsOnDoubles(input: string): string {
    let reg = new RegExp('\\$\\{([^}]+)\\}', 'g');

    return input.replace(reg, '$1');
  }

  static removeBracketsOnSinglesWithAlias(
    input: string,
    alias: string
  ): string {
    let reg = new RegExp('\\$\\{([^}.]+)\\}', 'g');

    return input.replace(reg, `${alias}.$1`);
  }

  static removeBracketsOnSingles(input: string): string {
    let reg = new RegExp('\\$\\{([^}.]+)\\}', 'g');

    return input.replace(reg, '$1');
  }

  static removeBracketsOnCalculationSinglesMf(input: string): string {
    let reg = new RegExp('\\$\\{([^}.]+)\\}', 'g');

    return input.replace(reg, 'mf_$1');
  }

  static removeBracketsOnCalculationSinglesWithAlias(
    input: string,
    alias: string
  ): string {
    let reg = new RegExp('\\$\\{([^}.]+)\\}', 'g');

    return input.replace(reg, `${alias}\_$1`);
  }

  static removeBracketsOnCalculationSingles(input: string): string {
    let reg = new RegExp('\\$\\{([^}.]+)\\}', 'g');

    return input.replace(reg, '$1');
  }

  static removeBracketsOnCalculationDoubles(input: string): string {
    let reg = new RegExp('\\$\\{([^}.]+)[.]([^}.]+)\\}', 'g');

    return input.replace(reg, '$1_$2');
  }

  static replaceViewRefs(input: string, parentViewName: string): string {
    let reg = new RegExp('\\$\\{(\\w+)\\s+[Aa][Ss]\\s+(\\w+)\\}', 'g');

    return input.replace(reg, `${parentViewName}\_\_$1\_\_$2 AS $2`);
  }

  static removeBracketsOnViewFieldRefs(input: string): string {
    let reg = new RegExp('\\$\\{([^}.]+)[.]([^}.]+)\\}', 'g');

    return input.replace(reg, '$1.$2');
  }

  static IS_INTEGER(): RegExp {
    return cloneRegexp(/^[-]?\d+$/);
  }

  static IS_ZERO_TO_THREE_DIGITS_INTEGER(): RegExp {
    return cloneRegexp(/^[0-9]{1,3}$/);
  }

  // FRONT

  static HAS_UPPERCASE_VALUES(): RegExp {
    return cloneRegexp(/[A-Z]/g);
  }

  static IS_NUMBER_VALUES(): RegExp {
    return cloneRegexp(
      /^(?:[-]?\d+(?:[.]\d+)?)(?:\s*,\s*[-]?\d+(?:[.]\d+)?)*$/g
    );
  }

  static IS_TIMESTAMP(): RegExp {
    return cloneRegexp(
      /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?:[T\s])(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?$/g
    );
  }

  static IS_DAY_OF_WEEK_INDEX_VALUES(): RegExp {
    return cloneRegexp(/^(?:[1-7](\s*,\s*[1-7])*)$/);
  }

  static IS_NUMBER(): RegExp {
    return cloneRegexp(/^[-]?\d+(?:\.\d+)?$/);
  }

  static CONTAINS_A_to_Z(): RegExp {
    return cloneRegexp(/^[A-Z]+$/);
  }
}
