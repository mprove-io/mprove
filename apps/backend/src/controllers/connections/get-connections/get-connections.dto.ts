import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetConnectionsRequest } from '#common/types/backend/routes/connections/get-connections/get-connections-request';
import { zToBackendGetConnectionsResponse } from '#common/types/backend/routes/connections/get-connections/get-connections-response';

export class ToBackendGetConnectionsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsRequest })
) {}

export class ToBackendGetConnectionsResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetConnectionsResponse }
) {}
