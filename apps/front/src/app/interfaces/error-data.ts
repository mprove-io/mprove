import { apiToBackend } from '~front/barrels/api-to-backend';

export interface ErrorData {
  message: string;
  reqTraceId: string;
  reqIdempotencyKey: string;
  reqInfoName: apiToBackend.ToBackendRequestInfoNameEnum;
  error: any;
}
