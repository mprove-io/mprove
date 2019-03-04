const cloneRegexp = require('clone-regexp');

export class MyRegex {
  static SLASH_G(): RegExp {
    return cloneRegexp(/[/]/g);
  }

  static STARTS_WITH_DOT(): RegExp {
    return cloneRegexp(/^[.]/);
  }

  static ENDS_WITH_MD(): RegExp {
    return cloneRegexp(/[.]md$/);
  }

  static CAPTURE_EXT(): RegExp {
    return cloneRegexp(/([.][\s\S]+)$/);
  }

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

  static replaceSlashesWithUnderscores(input: string): string {
    return input.split(`/`).join(`___`);
  }
}
