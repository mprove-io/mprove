import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetConnectionSchemasRequest } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-request';
import { zToBackendGetConnectionSchemasResponse } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-response';

export class ToBackendGetConnectionSchemasRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSchemasRequest })
) {}

export class ToBackendGetConnectionSchemasResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetConnectionSchemasResponse }
) {}
