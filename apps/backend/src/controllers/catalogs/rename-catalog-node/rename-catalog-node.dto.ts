import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRenameCatalogNodeRequest } from '#common/types/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-request';
import { zToBackendRenameCatalogNodeResponse } from '#common/types/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-response';

export class ToBackendRenameCatalogNodeRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRenameCatalogNodeRequest })
) {}

export class ToBackendRenameCatalogNodeResponseDto extends createBackendResponseDto(
  { schema: zToBackendRenameCatalogNodeResponse }
) {}
