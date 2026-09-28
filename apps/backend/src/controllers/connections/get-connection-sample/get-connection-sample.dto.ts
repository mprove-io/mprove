import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionSampleRequest } from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-request';
import { zToBackendGetConnectionSampleResponse } from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-response';

export class ToBackendGetConnectionSampleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSampleRequest })
) {}

export class ToBackendGetConnectionSampleResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetConnectionSampleResponse }
) {}
