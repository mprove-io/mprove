import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionSampleRequest } from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-request';
import { zToBackendGetConnectionSampleResponse } from '#common/zod/backend/routes/connections/get-connection-sample/get-connection-sample-response';

export class ToBackendGetConnectionSampleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSampleRequest })
) {}

export class ToBackendGetConnectionSampleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSampleResponse })
) {}
