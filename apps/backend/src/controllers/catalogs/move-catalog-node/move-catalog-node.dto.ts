import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendMoveCatalogNodeRequest } from '#common/types/backend/routes/catalogs/move-catalog-node/move-catalog-node-request';
import { zToBackendMoveCatalogNodeResponse } from '#common/types/backend/routes/catalogs/move-catalog-node/move-catalog-node-response';

export class ToBackendMoveCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMoveCatalogNodeRequest })
) {}

export class ToBackendMoveCatalogNodeResponseDto extends createBackendResponseDto(
  { schema: zToBackendMoveCatalogNodeResponse }
) {}
