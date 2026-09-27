import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionSchemasRequest } from '#common/zod/backend/routes/connections/get-connection-schemas/get-connection-schemas-request';
import { zToBackendGetConnectionSchemasResponse } from '#common/zod/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';

export class ToBackendGetConnectionSchemasRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSchemasRequest })
) {}

export class ToBackendGetConnectionSchemasResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSchemasResponse })
) {}
