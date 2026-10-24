export type BackendDbServerTsIsInFutureError = {
  code: 'BACKEND_DB_SERVER_TS_IS_IN_FUTURE';
  customData: {
    table: string;
    latestServerTs: number;
    currentTs: number;
  };
};
