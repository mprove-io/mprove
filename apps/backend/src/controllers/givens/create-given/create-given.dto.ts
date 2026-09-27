import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateGivenRequest } from '#common/zod/backend/routes/givens/create-given/create-given-request';
import { zToBackendCreateGivenResponse } from '#common/zod/backend/routes/givens/create-given/create-given-response';

export class ToBackendCreateGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateGivenRequest })
) {}

export class ToBackendCreateGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateGivenResponse })
) {}
