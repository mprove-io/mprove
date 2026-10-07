import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSpecialRebuildStructsRequest } from '#common/types/backend/routes/special/special-rebuild-structs/special-rebuild-structs-request';
import { zToBackendSpecialRebuildStructsResponse } from '#common/types/backend/routes/special/special-rebuild-structs/special-rebuild-structs-response';

export class ToBackendSpecialRebuildStructsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSpecialRebuildStructsRequest })
) {}

export class ToBackendSpecialRebuildStructsResponseDto extends createBackendResponseDto(
  { schema: zToBackendSpecialRebuildStructsResponse }
) {}
