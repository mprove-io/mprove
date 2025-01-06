export class ReportDataColumn {
  id: number;

  fields: {
    timestamp: number;
    [key: string]: any;
  };
}
