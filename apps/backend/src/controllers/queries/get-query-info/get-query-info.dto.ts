import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetQueryInfoRequest } from '#common/zod/backend/routes/query-info/get-query-info/get-query-info-request';
import { zToBackendGetQueryInfoResponse } from '#common/zod/backend/routes/query-info/get-query-info/get-query-info-response';

export class ToBackendGetQueryInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryInfoRequest })
) {}

export class ToBackendGetQueryInfoResponseDto extends createBackendResponseDto({
  schema: zToBackendGetQueryInfoResponse
}) {}
