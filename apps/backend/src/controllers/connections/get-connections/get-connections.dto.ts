import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionsRequest } from '#common/zod/backend/routes/connections/get-connections/get-connections-request';
import { zToBackendGetConnectionsResponse } from '#common/zod/backend/routes/connections/get-connections/get-connections-response';

export class ToBackendGetConnectionsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsRequest })
) {}

export class ToBackendGetConnectionsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionsResponse })
) {}
