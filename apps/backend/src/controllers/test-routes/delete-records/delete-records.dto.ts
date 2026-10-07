import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteRecordsRequest } from '#common/types/backend/routes/test-routes/delete-records/delete-records-request';
import { zToBackendDeleteRecordsResponse } from '#common/types/backend/routes/test-routes/delete-records/delete-records-response';

export class ToBackendDeleteRecordsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteRecordsRequest })
) {}

export class ToBackendDeleteRecordsResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteRecordsResponse }
) {}
