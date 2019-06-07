import * as apiObjects from '../../objects/_index';

export interface SetProjectCredentialsRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    credentials?: string;
    postgres_host?: string;
    postgres_port?: number;
    postgres_database?: string;
    postgres_user?: string;
    postgres_password?: string;
    server_ts: number;
  };
}

export interface SetProjectCredentialsResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
    dev_and_prod_structs_or_empty: apiObjects.Struct[];
  };
}
