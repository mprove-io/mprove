export type ScriptError =
  | {
      code: 'SCRIPT_USAGE_ERROR';
      message: string;
    }
  | {
      code: 'SCRIPT_SOURCE_ERROR';
      message: string;
      path: string;
      originalError?: unknown;
    }
  | {
      code: 'SCRIPT_INVALID_MANIFEST_ERROR';
      message: string;
      manifestPath: string;
    }
  | {
      code: 'SCRIPT_TITLE_MISMATCH_ERROR';
      message: string;
      filePath: string;
    }
  | {
      code: 'SCRIPT_MARKDOWN_REFERENCE_ERROR';
      message: string;
      path: string;
    }
  | {
      code: 'SCRIPT_HEADING_OVERFLOW_ERROR';
      message: string;
      path: string;
      line?: number;
    }
  | {
      code: 'SCRIPT_OUTPUT_WRITE_ERROR';
      message: string;
      outputPath: string;
      originalError: unknown;
    };
