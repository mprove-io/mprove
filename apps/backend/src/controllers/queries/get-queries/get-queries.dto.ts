import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetQueriesRequest } from '#common/types/backend/routes/queries/get-queries/get-queries-request';
import { zToBackendGetQueriesResponse } from '#common/types/backend/routes/queries/get-queries/get-queries-response';

export class ToBackendGetQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueriesRequest })
) {}

export class ToBackendGetQueriesResponseDto extends createBackendResponseDto({
  schema: zToBackendGetQueriesResponse
}) {}
