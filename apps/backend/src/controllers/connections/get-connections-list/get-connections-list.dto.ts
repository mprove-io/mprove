import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionsListRequest } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-request';
import { zToBackendGetConnectionsListResponse } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-response';

export class ToBackendGetConnectionsListRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsListRequest })
) {}

export class ToBackendGetConnectionsListResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetConnectionsListResponse }
) {}
