import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSpecialRebuildStructsRequest,
  zToBackendSpecialRebuildStructsResponse
} from '#common/zod/to-backend/special/to-backend-special-rebuild-structs';

export class ToBackendSpecialRebuildStructsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSpecialRebuildStructsRequest })
) {}

export class ToBackendSpecialRebuildStructsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSpecialRebuildStructsResponse })
) {}
