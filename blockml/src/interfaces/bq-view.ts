export interface BqView {
  bq_view_id: string;
  sql: string[];
  pdt_deps: string[];
  pdt_deps_all: string[];
}
