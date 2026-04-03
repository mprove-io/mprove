import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';

export class StoreItem {
  connectionId: string;

  type: ConnectionTypeEnum;

  baseUrl?: string;

  headerKeys?: string[];

  googleAuthScopes?: string[];
}
