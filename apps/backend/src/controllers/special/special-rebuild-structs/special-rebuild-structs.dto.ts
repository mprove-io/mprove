import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSpecialRebuildStructsRequest } from '#common/zod/backend/routes/special/special-rebuild-structs/special-rebuild-structs-request';
import { zToBackendSpecialRebuildStructsResponse } from '#common/zod/backend/routes/special/special-rebuild-structs/special-rebuild-structs-response';

export class ToBackendSpecialRebuildStructsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSpecialRebuildStructsRequest })
) {}

export class ToBackendSpecialRebuildStructsResponseDto extends createBackendResponseDto(
  { schema: zToBackendSpecialRebuildStructsResponse }
) {}
