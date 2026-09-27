import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSeedRecordsRequest } from '#common/zod/backend/routes/test-routes/seed-records/seed-records-request';
import { zToBackendSeedRecordsResponse } from '#common/zod/backend/routes/test-routes/seed-records/seed-records-response';

export class ToBackendSeedRecordsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSeedRecordsRequest })
) {}

export class ToBackendSeedRecordsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSeedRecordsResponse })
) {}
