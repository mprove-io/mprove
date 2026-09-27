import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditGivenRequest } from '#common/zod/backend/routes/givens/edit-given/edit-given-request';
import { zToBackendEditGivenResponse } from '#common/zod/backend/routes/givens/edit-given/edit-given-response';

export class ToBackendEditGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditGivenRequest })
) {}

export class ToBackendEditGivenResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditGivenResponse })
) {}
