import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetQueryInfoRequest } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-request';
import { zToBackendGetQueryInfoResponse } from '#common/types/backend/routes/query-info/get-query-info/get-query-info-response';

export class ToBackendGetQueryInfoRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueryInfoRequest })
) {}

export class ToBackendGetQueryInfoResponseDto extends createBackendResponseDto({
  schema: zToBackendGetQueryInfoResponse
}) {}
