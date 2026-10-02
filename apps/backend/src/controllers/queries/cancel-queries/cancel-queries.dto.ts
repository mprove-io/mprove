import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCancelQueriesRequest } from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-request';
import { zToBackendCancelQueriesResponse } from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-response';

export class ToBackendCancelQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCancelQueriesRequest })
) {}

export class ToBackendCancelQueriesResponseDto extends createBackendResponseDto(
  { schema: zToBackendCancelQueriesResponse }
) {}
