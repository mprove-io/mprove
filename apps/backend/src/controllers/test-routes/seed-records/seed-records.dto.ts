import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSeedRecordsRequest } from '#common/types/backend/routes/test-routes/seed-records/seed-records-request';
import { zToBackendSeedRecordsResponse } from '#common/types/backend/routes/test-routes/seed-records/seed-records-response';

export class ToBackendSeedRecordsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSeedRecordsRequest })
) {}

export class ToBackendSeedRecordsResponseDto extends createBackendResponseDto({
  schema: zToBackendSeedRecordsResponse
}) {}
