import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetSessionsListRequest } from '#common/types/backend/routes/sessions/get-sessions-list/get-sessions-list-request';
import { zToBackendGetSessionsListResponse } from '#common/types/backend/routes/sessions/get-sessions-list/get-sessions-list-response';

export class ToBackendGetSessionsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionsListRequest })
) {}

export class ToBackendGetSessionsListResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetSessionsListResponse }
) {}
