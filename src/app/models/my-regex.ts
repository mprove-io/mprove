let cloneRegexp = require('clone-regexp');

export class MyRegex {
  static IS_NUMBER_VALUES(): RegExp {
    return cloneRegexp(
      /^(?:[-]?\d+(?:[.]\d+)?)(?:\s*,\s*[-]?\d+(?:[.]\d+)?)*$/g);
  }

  static IS_DAY_OF_WEEK_INDEX_VALUES(): RegExp {
    return cloneRegexp(
      /^(?:[1-7](\s*,\s*[1-7])*)$/);
  }

  static IS_NUMBER(): RegExp {
    return cloneRegexp(
      /^[-]?\d+(?:\.\d+)?$/);
  }

  static IS_INTEGER(): RegExp {
    return cloneRegexp(
      /^[-]?\d+$/);
  }

  static CAPTURE_FILE_ID_AND_EXT(): RegExp {
    return cloneRegexp(
      /^(.*)\.(.*)$/g);
  }
}

