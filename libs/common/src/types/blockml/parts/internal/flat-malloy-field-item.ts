import type { FieldInfo } from '@malloydata/malloy-interfaces';

export type FlatMalloyFieldItem = {
  path: string[];
  field: FieldInfo;
  fileName: string;
  filePath: string;
  lineNum: number;
  sourceExpression?: MalloySourceExpression;
  sourceAnnotationValues: string[];
};

export type MalloySourceExpression = {
  node: string;
  units?: string;
  e?: {
    node: string;
    path?: string[];
  };
};
