import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteRecordsRequest,
  zToBackendDeleteRecordsResponse
} from '#common/zod/to-backend/test-routes/to-backend-delete-records';

export class ToBackendDeleteRecordsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRecordsRequest })
) {}

export class ToBackendDeleteRecordsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRecordsResponse })
) {}
