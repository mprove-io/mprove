export type ReportDataColumn = {
  id: number;
  fields?: { timestamp: number } & Record<string, any>;
};
