import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetConnectionSampleRequest,
  zToBackendGetConnectionSampleResponse
} from '#common/zod/to-backend/connections/to-backend-get-connection-sample';

export class ToBackendGetConnectionSampleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSampleRequest })
) {}

export class ToBackendGetConnectionSampleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSampleResponse })
) {}
