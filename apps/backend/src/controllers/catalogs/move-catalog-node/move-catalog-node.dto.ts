import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendMoveCatalogNodeRequest,
  zToBackendMoveCatalogNodeResponse
} from '#common/zod/to-backend/catalogs/to-backend-move-catalog-node';

export class ToBackendMoveCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMoveCatalogNodeRequest })
) {}

export class ToBackendMoveCatalogNodeResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendMoveCatalogNodeResponse })
) {}
