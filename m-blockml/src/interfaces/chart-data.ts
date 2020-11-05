export interface ChartData {
  xField: string;
  xFieldLineNum: number;

  yField: string;
  yFieldLineNum: number;

  yFields: string[];
  yFieldsLineNum: number;

  hideColumns: string[];
  hideColumnsLineNum: number;

  multiField: string;
  multiFieldLineNum: number;

  valueField: string;
  valueFieldLineNum: number;

  previousValueField: string;
  previousValueFieldLineNum: number;
}
