import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import { zToBackendDeleteProviderRequest } from '#common/zod/to-backend/providers/delete-provider/delete-provider-request';
import { zToBackendDeleteProviderResponse } from '#common/zod/to-backend/providers/delete-provider/delete-provider-response';

export class ToBackendDeleteProviderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderRequest })
) {}

export class ToBackendDeleteProviderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteProviderResponse })
) {}
