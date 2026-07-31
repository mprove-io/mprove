import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetProvidersRequest,
  zToBackendGetProvidersResponse
} from '#common/zod/to-backend/providers/to-backend-get-providers';

export class ToBackendGetProvidersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProvidersRequest })
) {}

export class ToBackendGetProvidersResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProvidersResponse })
) {}
