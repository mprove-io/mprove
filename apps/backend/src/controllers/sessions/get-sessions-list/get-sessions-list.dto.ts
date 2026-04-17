import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetSessionsListRequest,
  zToBackendGetSessionsListResponse
} from '#common/zod/to-backend/sessions/to-backend-get-sessions-list';

export class ToBackendGetSessionsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionsListRequest })
) {}

export class ToBackendGetSessionsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionsListResponse })
) {}
