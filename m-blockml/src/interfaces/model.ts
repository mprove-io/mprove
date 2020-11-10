import { FileTopBasic } from './file-top-basic';
import { Join } from './join';
import { FieldExt } from './field-ext';

export interface Model extends FileTopBasic {
  model: string;
  modelLineNum: number;

  hidden: string; // boolean
  hiddenLineNum: number;

  label: string;
  labelLineNum: number;

  group: string;
  groupLineNum: number;

  description: string;
  descriptionLineNum: number;

  accessUsers: string[];
  accessUsersLineNum: number;

  alwaysJoin: string;
  alwaysJoinLineNum: number;
  alwaysJoinList: {
    [as: string]: number;
  };

  sqlAlwaysWhere: string;
  sqlAlwaysWhereLineNum: number;
  sqlAlwaysWhereReal: string;

  sqlAlwaysWhereCalc: string;
  sqlAlwaysWhereCalcLineNum: number;
  sqlAlwaysWhereCalcReal: string;

  udfs: string[];
  udfsLineNum: number;

  joins: Join[];
  joinsLineNum: number;

  fields: FieldExt[];
  fieldsLineNum: number;

  fromAs: string;

  fieldsDeps: {
    [field: string]: {
      [dep: string]: number;
    };
  };
  fieldsDepsAfterSingles: {
    [field: string]: {
      [dep: string]: number;
    };
  };

  fieldsDoubleDeps: {
    [field: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  fieldsDoubleDepsAfterSingles: {
    [field: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  joinsDoubleDeps: {
    [alias: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  joinsPreparedDeps: {
    [alias: string]: {
      [as: string]: number;
    };
  };

  joinsDoubleDepsAfterSingles: {
    [alias: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  joinsSorted: string[];

  sqlAlwaysWhereDoubleDeps: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereDoubleDepsAfterSingles: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereCalcDoubleDeps: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereCalcForceDims: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereCalcDepsAfterSingles: {
    [dep: string]: number;
  };

  sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions: {
    [as: string]: {
      [dep: string]: number;
    };
  };
}
