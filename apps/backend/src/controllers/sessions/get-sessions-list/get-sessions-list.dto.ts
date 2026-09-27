import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetSessionsListRequest } from '#common/zod/backend/routes/sessions/get-sessions-list/get-sessions-list-request';
import { zToBackendGetSessionsListResponse } from '#common/zod/backend/routes/sessions/get-sessions-list/get-sessions-list-response';

export class ToBackendGetSessionsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionsListRequest })
) {}

export class ToBackendGetSessionsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionsListResponse })
) {}
