import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetQueryRequest } from '#common/types/backend/routes/queries/get-query/get-query-request';
import { zToBackendGetQueryResponse } from '#common/types/backend/routes/queries/get-query/get-query-response';

export class ToBackendGetQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryRequest })
) {}

export class ToBackendGetQueryResponseDto extends createBackendResponseDto({
  schema: zToBackendGetQueryResponse
}) {}
