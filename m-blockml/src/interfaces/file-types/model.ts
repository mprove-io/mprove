import { FileBasic } from '~/interfaces/file/file-basic';
import { Join } from '~/interfaces/join';
import { FieldAny } from '~/interfaces/field/field-any';
import { api } from '~/barrels/api';
import { FilterBricksDictionary } from '~/interfaces/filter-bricks-dictionary';

export interface Model extends FileBasic {
  model?: string;
  model_line_num?: number;

  hidden?: string; // boolean
  hidden_line_num?: number;

  label?: string;
  label_line_num?: number;

  group?: string;
  group_line_num?: number;

  description?: string;
  description_line_num?: number;

  access_users?: string[];
  access_users_line_num?: number;

  access_roles?: string[];
  access_roles_line_num?: number;

  always_join?: string;
  always_join_line_num?: number;

  sql_always_where?: string;
  sql_always_where_line_num?: number;

  sql_always_where_calc?: string;
  sql_always_where_calc_line_num?: number;

  udfs?: string[];
  udfs_line_num?: number;

  joins?: Join[];
  joins_line_num?: number;

  fields?: FieldAny[];
  fields_line_num?: number;

  //

  connection?: api.ProjectConnection;

  fieldsDeps?: {
    [fieldName: string]: {
      [depName: string]: number;
    };
  };

  fieldsDepsAfterSingles?: {
    [fieldName: string]: {
      [depName: string]: number;
    };
  };

  filters?: FilterBricksDictionary;

  alwaysJoinUnique?: {
    [as: string]: number;
  };

  sqlAlwaysWhereReal?: string;

  sqlAlwaysWhereCalcReal?: string;

  fromAs?: string;

  fieldsDoubleDeps?: {
    [field: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  fieldsDoubleDepsAfterSingles?: {
    [field: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  // joinsDoubleDeps?: {
  //   [alias: string]: {
  //     [as: string]: {
  //       [dep: string]: number;
  //     };
  //   };
  // };

  // joinsPreparedDeps?: {
  //   [alias: string]: {
  //     [as: string]: number;
  //   };
  // };

  joinsDoubleDepsAfterSingles?: {
    [alias: string]: {
      [as: string]: {
        [dep: string]: number;
      };
    };
  };

  joinsSorted?: string[];

  sqlAlwaysWhereDoubleDeps?: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereDoubleDepsAfterSingles?: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereCalcDoubleDeps?: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlAlwaysWhereCalcDepsAfterSingles?: {
    [dep: string]: number;
  };

  sqlAlwaysWhereCalcDoubleDepsAfterSubstitutions?: {
    [as: string]: {
      [dep: string]: number;
    };
  };
}
