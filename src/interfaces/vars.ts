import { api } from '../barrels/api';
import { Model } from './model';
import { UdfsDict } from './udfs-dict';
import { BqView } from './bq-view';

export interface Vars {
  model: Model;

  select: string[];

  sorts: string;

  timezone: string;

  limit: string;

  filters: {
    [filter: string]: string[];
  };

  filters_fractions: {
    [s: string]: api.Fraction[];
  };

  weekStart: api.ProjectWeekStartEnum;

  bqProject: string;

  projectId: string;

  structId: string;

  udfs_dict: UdfsDict;

  dep_measures: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  main_text: string[];

  group_main_by: string[];

  main_fields: {
    as_name: string;
    field_name: string;
    element_name: string;
  }[];

  selected: {
    [s: string]: number;
  };

  processed_fields: {
    [s: string]: string;
  };

  main_udfs: {
    [s: string]: number;
  };

  needs_doubles: {
    [a: string]: {
      [f: string]: number;
    };
  };

  joins: {
    [s: string]: number;
  };

  needs_all: {
    [a: string]: {
      [f: string]: number;
    };
  };

  where_main: {
    [s: string]: string[];
  };

  having_main: {
    [s: string]: string[];
  };

  where_calc: {
    [s: string]: string[];
  };

  filters_conditions: {
    [s: string]: string[];
  };

  untouched_filters_conditions: {
    [s: string]: string[];
  };

  contents: string[];

  query_pdt_deps: { [id: string]: number };
  query_pdt_deps_all: { [id: string]: number };

  bqViews: BqView[];

  with: string[];
  with_parts: {
    [viewPartName: string]: {
      content: string;
      content_prepared: string;
      parent_view_name: string;
      deps: { [depName: string]: number };
    };
  };

  joins_where: string[];

  query: string[];
}
