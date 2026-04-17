import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetConnectionSchemasRequest,
  zToBackendGetConnectionSchemasResponse
} from '#common/zod/to-backend/connections/to-backend-get-connection-schemas';

export class ToBackendGetConnectionSchemasRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSchemasRequest })
) {}

export class ToBackendGetConnectionSchemasResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetConnectionSchemasResponse })
) {}
