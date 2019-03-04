import { TopBasic } from './top-basic';
import { Join } from './join';
import { FieldExt } from './field-ext';

export interface Model extends TopBasic {

  model: string;
  model_line_num: number;

  hidden: string; // boolean
  hidden_line_num: number;

  label: string;
  label_line_num: number;

  group: string;
  group_line_num: number;

  description: string;
  description_line_num: number;

  access_users: string[];
  access_users_line_num: number;

  always_join: string;
  always_join_line_num: number;
  always_join_list: {
    [as: string]: number
  };

  sql_always_where: string;
  sql_always_where_line_num: number;
  sql_always_where_real: string;

  sql_always_where_calc: string;
  sql_always_where_calc_line_num: number;
  sql_always_where_calc_real: string;

  udfs: string[];
  udfs_line_num: number;

  joins: Join[];
  joins_line_num: number;

  fields: FieldExt[];
  fields_line_num: number;

  from_as: string;

  fields_deps: {
    [field: string]: {
      [dep: string]: number
    };
  };
  fields_deps_after_singles: {
    [field: string]: {
      [dep: string]: number
    };
  };

  fields_double_deps: {
    [field: string]: {
      [as: string]: {
        [dep: string]: number
      }
    }
  };

  fields_double_deps_after_singles: {
    [field: string]: {
      [as: string]: {
        [dep: string]: number
      }
    }
  };

  joins_double_deps: {
    [alias: string]: {
      [as: string]: {
        [dep: string]: number
      }
    }
  };

  joins_prepared_deps: {
    [alias: string]: {
      [as: string]: number
    }
  };

  joins_double_deps_after_singles: {
    [alias: string]: {
      [as: string]: {
        [dep: string]: number
      }
    }
  };

  joins_sorted: string[];

  sql_always_where_double_deps: {
    [as: string]: {
      [dep: string]: number
    }
  };

  sql_always_where_double_deps_after_singles: {
    [as: string]: {
      [dep: string]: number
    }
  };

  sql_always_where_calc_double_deps: {
    [as: string]: {
      [dep: string]: number
    }
  };

  sql_always_where_calc_force_dims: {
    [as: string]: {
      [dep: string]: number
    }
  };

  sql_always_where_calc_deps_after_singles: {
    [dep: string]: number
  };

  sql_always_where_calc_double_deps_after_substitutions: {
    [as: string]: {
      [dep: string]: number
    }
  };
}