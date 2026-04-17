import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetRebuildStructRequest,
  zToBackendGetRebuildStructResponse
} from '#common/zod/to-backend/test-routes/to-backend-get-rebuild-struct';

export class ToBackendGetRebuildStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRebuildStructRequest })
) {}

export class ToBackendGetRebuildStructResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRebuildStructResponse })
) {}
