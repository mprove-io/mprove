import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRunQueriesRequest } from '#common/types/backend/routes/queries/run-queries/run-queries-request';
import { zToBackendRunQueriesResponse } from '#common/types/backend/routes/queries/run-queries/run-queries-response';

export class ToBackendRunQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesRequest })
) {}

export class ToBackendRunQueriesResponseDto extends createBackendResponseDto({
  schema: zToBackendRunQueriesResponse
}) {}
