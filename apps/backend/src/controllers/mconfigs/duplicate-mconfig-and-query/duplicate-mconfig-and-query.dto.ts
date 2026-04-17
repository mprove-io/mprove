import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDuplicateMconfigAndQueryRequest,
  zToBackendDuplicateMconfigAndQueryResponse
} from '#common/zod/to-backend/mconfigs/to-backend-duplicate-mconfig-and-query';

export class ToBackendDuplicateMconfigAndQueryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDuplicateMconfigAndQueryRequest })
) {}

export class ToBackendDuplicateMconfigAndQueryResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDuplicateMconfigAndQueryResponse })
) {}
