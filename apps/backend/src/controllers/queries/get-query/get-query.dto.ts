import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetQueryRequest } from '#common/zod/backend/routes/queries/get-query/get-query-request';
import { zToBackendGetQueryResponse } from '#common/zod/backend/routes/queries/get-query/get-query-response';

export class ToBackendGetQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryRequest })
) {}

export class ToBackendGetQueryResponseDto extends createBackendResponseDto({
  schema: zToBackendGetQueryResponse
}) {}
