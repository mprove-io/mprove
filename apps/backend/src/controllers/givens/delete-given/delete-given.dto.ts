import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteGivenRequest } from '#common/zod/backend/routes/givens/delete-given/delete-given-request';
import { zToBackendDeleteGivenResponse } from '#common/zod/backend/routes/givens/delete-given/delete-given-response';

export class ToBackendDeleteGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteGivenRequest })
) {}

export class ToBackendDeleteGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteGivenResponse })
) {}
