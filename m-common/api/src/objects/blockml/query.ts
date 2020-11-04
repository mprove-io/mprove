import * as apiEnums from '../../enums/_index';

export class Query {
  queryId: string;
  projectId: string;
  structId: string;
  pdtDeps: string[];
  pdtDepsAll: string[];
  sql: string[];
  isPdt: boolean;
  pdtTriggerTime: string;
  pdtTriggerSql: string;
  pdtNeedStartByTime: boolean;
  pdtNeedStartByTriggerSql: boolean;
  pdtTriggerSqlValue: string;
  pdtTriggerSqlLastErrorMessage: string;
  pdtId: string;
  status: apiEnums.QueryStatusEnum;
  lastRunBy: string;
  lastRunTs: number;
  lastCancelTs: number;
  lastCompleteTs: number;
  lastCompleteDuration: number;
  lastErrorMessage: string;
  lastErrorTs: number;
  data: string;
  temp: boolean;
  serverTs: number;
}
