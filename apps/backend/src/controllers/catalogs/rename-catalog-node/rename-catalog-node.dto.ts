import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRenameCatalogNodeRequest } from '#common/zod/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-request';
import { zToBackendRenameCatalogNodeResponse } from '#common/zod/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-response';

export class ToBackendRenameCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRenameCatalogNodeRequest })
) {}

export class ToBackendRenameCatalogNodeResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRenameCatalogNodeResponse })
) {}
