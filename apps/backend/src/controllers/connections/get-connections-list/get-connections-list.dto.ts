import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetConnectionsListRequest,
  zToBackendGetConnectionsListResponse
} from '#common/zod/to-backend/connections/to-backend-get-connections-list';

export class ToBackendGetConnectionsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsListRequest })
) {}

export class ToBackendGetConnectionsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsListResponse })
) {}
