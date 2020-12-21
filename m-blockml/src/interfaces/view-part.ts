export interface ViewPart {
  sql: string[];
  viewName: string;
  deps: { [depName: string]: number };
}
