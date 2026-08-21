import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

type AnthropicCapabilitySupport = {
  [key: string]: unknown;
  supported: boolean;
};

export type AnthropicModel = {
  [key: string]: unknown;
  id: string;
  display_name: string;
  created_at: string;
  max_input_tokens?: number;
  max_tokens?: number;
  capabilities?: {
    [key: string]: unknown;
    image_input?: AnthropicCapabilitySupport;
    pdf_input?: AnthropicCapabilitySupport;
    effort?: {
      [key: string]: unknown;
      supported: boolean;
      low?: AnthropicCapabilitySupport;
      medium?: AnthropicCapabilitySupport;
      high?: AnthropicCapabilitySupport;
      max?: AnthropicCapabilitySupport;
      xhigh?: AnthropicCapabilitySupport;
    };
    thinking?: {
      [key: string]: unknown;
      supported: boolean;
      types?: {
        [key: string]: unknown;
        adaptive?: AnthropicCapabilitySupport;
        enabled?: AnthropicCapabilitySupport;
      };
    };
  };
};

let zAnthropicCapabilitySupport = z.looseObject({
  supported: z.boolean()
});

export let zAnthropicModel = z
  .looseObject({
    id: z.string().trim().min(1),
    display_name: z.string().trim().min(1),
    created_at: z.string(),
    max_input_tokens: z.number().int().nonnegative().nullish(),
    max_tokens: z.number().int().nonnegative().nullish(),
    capabilities: z
      .looseObject({
        image_input: zAnthropicCapabilitySupport.nullish(),
        pdf_input: zAnthropicCapabilitySupport.nullish(),
        effort: z
          .looseObject({
            supported: z.boolean(),
            low: zAnthropicCapabilitySupport.nullish(),
            medium: zAnthropicCapabilitySupport.nullish(),
            high: zAnthropicCapabilitySupport.nullish(),
            max: zAnthropicCapabilitySupport.nullish(),
            xhigh: zAnthropicCapabilitySupport.nullish()
          })
          .nullish(),
        thinking: z
          .looseObject({
            supported: z.boolean(),
            types: z
              .looseObject({
                adaptive: zAnthropicCapabilitySupport.nullish(),
                enabled: zAnthropicCapabilitySupport.nullish()
              })
              .nullish()
          })
          .nullish()
      })
      .nullish()
  })
  .meta({ id: 'AnthropicModel' });

assertTypesEqual<AnthropicModel, z.infer<typeof zAnthropicModel>>({
  value: true
});
