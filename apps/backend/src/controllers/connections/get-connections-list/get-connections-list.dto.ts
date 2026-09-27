import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionsListRequest } from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-request';
import { zToBackendGetConnectionsListResponse } from '#common/zod/backend/routes/connections/get-connections-list/get-connections-list-response';

export class ToBackendGetConnectionsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsListRequest })
) {}

export class ToBackendGetConnectionsListResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsListResponse })
) {}
