import { createZodDto, type ZodDto } from 'nestjs-zod';
import type { z } from 'zod';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';

export function createBackendResponseDto(item: {
  schema: z.ZodType<object>;
}): ZodDto<z.ZodType<object>, false> {
  let { schema } = item;

  // DTO classes are Swagger adapters. Widen their instance type to object so
  // they can extend a discriminated union, retaining the full runtime schema.
  let strippedSchema: z.ZodType<object> = zodStripCustom({ schema: schema });

  let dto: ZodDto<z.ZodType<object>, false> = createZodDto(strippedSchema);

  return dto;
}
