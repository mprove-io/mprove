import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetRebuildStructRequest } from '#common/types/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-request';
import { zToBackendGetRebuildStructResponse } from '#common/types/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-response';

export class ToBackendGetRebuildStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetRebuildStructRequest })
) {}

export class ToBackendGetRebuildStructResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetRebuildStructResponse }
) {}
