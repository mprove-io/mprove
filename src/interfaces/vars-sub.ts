import { api } from '../barrels/api';
import { View } from './view';
import { UdfsDict } from './udfs-dict';
import { BqView } from './bq-view';

export interface VarsSub {
  view: View;

  select: string[];

  timezone: string;

  weekStart: api.ProjectWeekStartEnum;

  bqProject: string;

  projectId: string;

  structId: string;

  udfs_dict: UdfsDict;

  dep_measures: {
    [dep: string]: number
  };

  dep_dimensions: {
    [dep: string]: number
  };

  main_text: string[];

  group_main_by: string[];

  main_fields: string[];

  selected: {
    [s: string]: number
  };

  processed_fields: {
    [s: string]: string
  };

  extra_udfs: {
    [s: string]: number
  };

  needs_all: {
    [a: string]: number
  };

  contents: string[];

  bqViews: BqView[];

  with: string[];

  query: string[];
  calc_query: string[];
}
