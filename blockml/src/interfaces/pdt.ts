export interface Pdt {
  view: string;
  name: string;
  table_ref: string;
  sql: string[];
  pdt_deps: string[];
  pdt_deps_all: string[];
  pdt_trigger_time: string;
  pdt_trigger_sql: string;

  pdt_trigger_time_line_num: number;
  pdt_trigger_sql_line_num: number;
  file: string;
  path: string;
}
