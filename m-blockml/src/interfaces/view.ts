import { TopBasic } from './top-basic';
import { FieldExt } from './field-ext';

export interface View extends TopBasic {
  view: string;
  viewLineNum: number;

  label: string;
  labelLineNum: number;

  description: string;
  descriptionLineNum: number;

  accessUsers: string[];
  accessUsersLineNum: number;

  table: string;
  tableLineNum: number;

  derivedTable: string;
  derivedTableLineNum: number;

  derivedTableStart: string;
  derivedTableNew: string;

  parts: {
    [viewPartName: string]: {
      content: string;
      contentPrepared: string;
      parentViewName: string;
      deps: { [depName: string]: number };
    };
  };

  permanent: string; // boolean
  permanentLineNum: number;

  // pdtTriggerTime: string;
  // pdtTriggerTimeLineNum: number;

  // pdtTriggerSql: string;
  // pdtTriggerSqlLineNum: number;

  udfs: string[];
  udfsLineNum: number;

  fields: FieldExt[];
  fieldsLineNum: number;

  fieldsDeps: {
    [field: string]: {
      [dep: string]: number;
    };
  };

  fieldsDepsAfterSingles: {
    [field: string]: {
      [dep: string]: number;
    };
  };

  asDeps: {
    [as: string]: {
      viewName: string;
      fields: { [field: string]: number };
    };
  };

  // pdtViewDeps: {
  //   [view: string]: number;
  // };

  // pdtViewDepsAll: {
  //   [view: string]: number;
  // };

  viewDeps: string[];
  // isPdt: boolean;
}
