import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetGivensRequest } from '#common/zod/backend/routes/givens/get-givens/get-givens-request';
import { zToBackendGetGivensResponse } from '#common/zod/backend/routes/givens/get-givens/get-givens-response';

export class ToBackendGetGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetGivensRequest })
) {}

export class ToBackendGetGivensResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetGivensResponse })
) {}
