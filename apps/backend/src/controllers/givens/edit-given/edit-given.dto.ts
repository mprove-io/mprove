import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendEditGivenRequest } from '#common/types/backend/routes/givens/edit-given/edit-given-request';
import { zToBackendEditGivenResponse } from '#common/types/backend/routes/givens/edit-given/edit-given-response';

export class ToBackendEditGivenRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditGivenRequest })
) {}

export class ToBackendEditGivenResponseDto extends createBackendResponseDto({
  schema: zToBackendEditGivenResponse
}) {}
