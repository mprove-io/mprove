import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRenameCatalogNodeRequest,
  zToBackendRenameCatalogNodeResponse
} from '#common/zod/to-backend/catalogs/to-backend-rename-catalog-node';

export class ToBackendRenameCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRenameCatalogNodeRequest })
) {}

export class ToBackendRenameCatalogNodeResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRenameCatalogNodeResponse })
) {}
