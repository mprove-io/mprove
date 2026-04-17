import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSeedRecordsRequest,
  zToBackendSeedRecordsResponse
} from '#common/zod/to-backend/test-routes/to-backend-seed-records';

export class ToBackendSeedRecordsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSeedRecordsRequest })
) {}

export class ToBackendSeedRecordsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSeedRecordsResponse })
) {}
