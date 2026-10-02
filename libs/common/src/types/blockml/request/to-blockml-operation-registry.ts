import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { ToBlockmlOperation } from '#common/types/blockml/request/to-blockml-operation';
import type { ToBlockmlResponseBase } from '#common/types/blockml/response/to-blockml-response-base';
import type { ToBlockmlRebuildStructRequest } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-request';
import { zToBlockmlRebuildStructRequest } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-request';
import type { ToBlockmlRebuildStructResponse } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-response';
import { zToBlockmlRebuildStructResponse } from '#common/types/blockml/routes/rebuild-struct/rebuild-struct-response';

type ValidateOperationRegistry<
  TRegistry extends {
    [TOperation in ToBlockmlOperation]: {
      request: { operation: TOperation; traceId: string; input: unknown };
      response: ToBlockmlResponseBase<TOperation, unknown, unknown>;
    };
  }
> = TRegistry;

export type ToBlockmlOperationRegistry = ValidateOperationRegistry<{
  rebuildStruct: {
    request: ToBlockmlRebuildStructRequest;
    response: ToBlockmlRebuildStructResponse;
  };
}>;

export const zToBlockmlOperationRegistry = {
  rebuildStruct: {
    request: zToBlockmlRebuildStructRequest,
    response: zToBlockmlRebuildStructResponse
  }
} satisfies {
  [TOperation in ToBlockmlOperation]: {
    request: z.ZodType<ToBlockmlOperationRegistry[TOperation]['request']>;
    response: z.ZodType<ToBlockmlOperationRegistry[TOperation]['response']>;
  };
};

assertTypesEqual<
  ToBlockmlOperationRegistry,
  {
    [TOperation in ToBlockmlOperation]: {
      request: z.infer<
        (typeof zToBlockmlOperationRegistry)[TOperation]['request']
      >;
      response: z.infer<
        (typeof zToBlockmlOperationRegistry)[TOperation]['response']
      >;
    };
  }
>({ value: true });
