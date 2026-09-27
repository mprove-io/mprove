import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetRebuildStructRequest } from '#common/zod/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-request';
import { zToBackendGetRebuildStructResponse } from '#common/zod/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-response';

export class ToBackendGetRebuildStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRebuildStructRequest })
) {}

export class ToBackendGetRebuildStructResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRebuildStructResponse })
) {}
