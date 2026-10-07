import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetConnectionSampleRequest } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-request';
import { zToBackendGetConnectionSampleResponse } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-response';

export class ToBackendGetConnectionSampleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSampleRequest })
) {}

export class ToBackendGetConnectionSampleResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetConnectionSampleResponse }
) {}
