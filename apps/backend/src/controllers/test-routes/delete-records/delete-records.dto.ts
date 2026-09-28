import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteRecordsRequest } from '#common/zod/backend/routes/test-routes/delete-records/delete-records-request';
import { zToBackendDeleteRecordsResponse } from '#common/zod/backend/routes/test-routes/delete-records/delete-records-response';

export class ToBackendDeleteRecordsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRecordsRequest })
) {}

export class ToBackendDeleteRecordsResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteRecordsResponse }
) {}
