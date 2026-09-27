import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendMoveCatalogNodeRequest } from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-request';
import { zToBackendMoveCatalogNodeResponse } from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-response';

export class ToBackendMoveCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMoveCatalogNodeRequest })
) {}

export class ToBackendMoveCatalogNodeResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMoveCatalogNodeResponse })
) {}
