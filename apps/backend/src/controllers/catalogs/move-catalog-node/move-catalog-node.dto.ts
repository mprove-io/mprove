import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendMoveCatalogNodeRequest } from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-request';
import { zToBackendMoveCatalogNodeResponse } from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-response';

export class ToBackendMoveCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMoveCatalogNodeRequest })
) {}

export class ToBackendMoveCatalogNodeResponseDto extends createBackendResponseDto(
  { schema: zToBackendMoveCatalogNodeResponse }
) {}
