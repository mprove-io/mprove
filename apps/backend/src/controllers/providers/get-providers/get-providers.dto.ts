import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendGetProvidersRequest } from '#common/zod/to-backend/providers/get-providers/get-providers-request';
import { zToBackendGetProvidersResponse } from '#common/zod/to-backend/providers/get-providers/get-providers-response';

export class ToBackendGetProvidersRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProvidersRequest })
) {}

export class ToBackendGetProvidersResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetProvidersResponse })
) {}
