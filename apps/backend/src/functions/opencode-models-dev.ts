// ───────────────────────────────────────────────────────────────────────────────
// Logic ported from external/opencode for loading models from models.dev API.
// Keep function names and content aligned with opencode source for diffing.
// ───────────────────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────────────────
// Types ported from external/opencode — models.dev schema
// Source: external/opencode/packages/opencode/src/provider/models.ts
// ───────────────────────────────────────────────────────────────────────────────

export type ModelsDevModel = {
  id: string;
  name: string;
  family?: string;
  release_date: string;
  attachment: boolean;
  reasoning: boolean;
  temperature: boolean;
  tool_call: boolean;
  interleaved?: true | { field: 'reasoning_content' | 'reasoning_details' };
  cost?: {
    input: number;
    output: number;
    cache_read?: number;
    cache_write?: number;
    context_over_200k?: {
      input: number;
      output: number;
      cache_read?: number;
      cache_write?: number;
    };
  };
  limit: { context: number; input?: number; output: number };
  modalities?: {
    input: ('text' | 'audio' | 'image' | 'video' | 'pdf')[];
    output: ('text' | 'audio' | 'image' | 'video' | 'pdf')[];
  };
  experimental?: boolean;
  status?: 'alpha' | 'beta' | 'deprecated';
  options: Record<string, any>;
  headers?: Record<string, string>;
  provider?: { npm?: string; api?: string };
  variants?: Record<string, Record<string, any>>;
};

export type ModelsDevProvider = {
  api?: string;
  name: string;
  env: string[];
  id: string;
  npm?: string;
  models: Record<string, ModelsDevModel>;
};

export type ModelsDevResponse = Record<string, ModelsDevProvider>;

// ───────────────────────────────────────────────────────────────────────────────
// Internal type matching Provider.Model from opencode
// Source: external/opencode/packages/opencode/src/provider/provider.ts
// ───────────────────────────────────────────────────────────────────────────────

export type ProviderModel = {
  id: string;
  providerID: string;
  api: { id: string; url: string; npm: string };
  name: string;
  family?: string;
  capabilities: {
    temperature: boolean;
    reasoning: boolean;
    attachment: boolean;
    toolcall: boolean;
    input: {
      text: boolean;
      audio: boolean;
      image: boolean;
      video: boolean;
      pdf: boolean;
    };
    output: {
      text: boolean;
      audio: boolean;
      image: boolean;
      video: boolean;
      pdf: boolean;
    };
    interleaved: boolean | { field: 'reasoning_content' | 'reasoning_details' };
  };
  cost: {
    input: number;
    output: number;
    cache: { read: number; write: number };
    experimentalOver200K?: {
      input: number;
      output: number;
      cache: { read: number; write: number };
    };
  };
  limit: { context: number; input?: number; output: number };
  status: 'alpha' | 'beta' | 'deprecated' | 'active';
  options: Record<string, any>;
  headers: Record<string, string>;
  release_date: string;
  variants: Record<string, Record<string, any>>;
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

function iife<T>(fn: () => T): T {
  return fn();
}

function mapObjectValues<V, R>(
  obj: Record<string, V>,
  fn: (value: V) => R
): Record<string, R> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
}

// ───────────────────────────────────────────────────────────────────────────────
// Ported from external/opencode ProviderTransform.variants
// Source: external/opencode/packages/opencode/src/provider/transform.ts
// ───────────────────────────────────────────────────────────────────────────────

const WIDELY_SUPPORTED_EFFORTS = ['low', 'medium', 'high'];
const OPENAI_EFFORTS = [
  'none',
  'minimal',
  ...WIDELY_SUPPORTED_EFFORTS,
  'xhigh'
];

export function variants(
  model: ProviderModel
): Record<string, Record<string, any>> {
  if (!model.capabilities.reasoning) return {};

  const id = model.id.toLowerCase();
  const isAnthropicAdaptive = [
    'opus-4-6',
    'opus-4.6',
    'sonnet-4-6',
    'sonnet-4.6'
  ].some(v => model.api.id.includes(v));
  const adaptiveEfforts = ['low', 'medium', 'high', 'max'];
  if (
    id.includes('deepseek') ||
    id.includes('minimax') ||
    id.includes('glm') ||
    id.includes('mistral') ||
    id.includes('kimi') ||
    id.includes('k2p5')
  )
    return {};

  if (id.includes('grok') && id.includes('grok-3-mini')) {
    if (model.api.npm === '@openrouter/ai-sdk-provider') {
      return {
        low: { reasoning: { effort: 'low' } },
        high: { reasoning: { effort: 'high' } }
      };
    }
    return {
      low: { reasoningEffort: 'low' },
      high: { reasoningEffort: 'high' }
    };
  }
  if (id.includes('grok')) return {};

  switch (model.api.npm) {
    case '@openrouter/ai-sdk-provider':
      if (
        !model.id.includes('gpt') &&
        !model.id.includes('gemini-3') &&
        !model.id.includes('claude')
      )
        return {};
      return Object.fromEntries(
        OPENAI_EFFORTS.map(effort => [
          effort,
          { reasoning: { effort: effort } }
        ])
      );

    case '@ai-sdk/gateway':
      if (model.id.includes('anthropic')) {
        if (isAnthropicAdaptive) {
          return Object.fromEntries(
            adaptiveEfforts.map(effort => [
              effort,
              { thinking: { type: 'adaptive' }, effort: effort }
            ])
          );
        }
        return {
          high: { thinking: { type: 'enabled', budgetTokens: 16000 } },
          max: { thinking: { type: 'enabled', budgetTokens: 31999 } }
        };
      }
      if (model.id.includes('google')) {
        if (id.includes('2.5')) {
          return {
            high: {
              thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: 16000
              }
            },
            max: {
              thinkingConfig: {
                includeThoughts: true,
                thinkingBudget: 24576
              }
            }
          };
        }
        return Object.fromEntries(
          ['low', 'high'].map(effort => [
            effort,
            { includeThoughts: true, thinkingLevel: effort }
          ])
        );
      }
      return Object.fromEntries(
        OPENAI_EFFORTS.map(effort => [effort, { reasoningEffort: effort }])
      );

    case '@ai-sdk/github-copilot':
      if (model.id.includes('gemini')) {
        return {};
      }
      if (model.id.includes('claude')) {
        return { thinking: { thinking_budget: 4000 } };
      }
      {
        const copilotEfforts = iife(() => {
          if (
            id.includes('5.1-codex-max') ||
            id.includes('5.2') ||
            id.includes('5.3')
          )
            return [...WIDELY_SUPPORTED_EFFORTS, 'xhigh'];
          const arr = [...WIDELY_SUPPORTED_EFFORTS];
          if (id.includes('gpt-5') && model.release_date >= '2025-12-04')
            arr.push('xhigh');
          return arr;
        });
        return Object.fromEntries(
          copilotEfforts.map(effort => [
            effort,
            {
              reasoningEffort: effort,
              reasoningSummary: 'auto',
              include: ['reasoning.encrypted_content']
            }
          ])
        );
      }

    case '@ai-sdk/cerebras':
    case '@ai-sdk/togetherai':
    case '@ai-sdk/xai':
    case '@ai-sdk/deepinfra':
    case 'venice-ai-sdk-provider':
    case '@ai-sdk/openai-compatible':
      return Object.fromEntries(
        WIDELY_SUPPORTED_EFFORTS.map(effort => [
          effort,
          { reasoningEffort: effort }
        ])
      );

    case '@ai-sdk/azure':
      if (id === 'o1-mini') return {};
      {
        const azureEfforts = ['low', 'medium', 'high'];
        if (id.includes('gpt-5-') || id === 'gpt-5') {
          azureEfforts.unshift('minimal');
        }
        return Object.fromEntries(
          azureEfforts.map(effort => [
            effort,
            {
              reasoningEffort: effort,
              reasoningSummary: 'auto',
              include: ['reasoning.encrypted_content']
            }
          ])
        );
      }

    case '@ai-sdk/openai':
      if (id === 'gpt-5-pro') return {};
      {
        const openaiEfforts = iife(() => {
          if (id.includes('codex')) {
            if (id.includes('5.2') || id.includes('5.3'))
              return [...WIDELY_SUPPORTED_EFFORTS, 'xhigh'];
            return WIDELY_SUPPORTED_EFFORTS;
          }
          const arr = [...WIDELY_SUPPORTED_EFFORTS];
          if (id.includes('gpt-5-') || id === 'gpt-5') {
            arr.unshift('minimal');
          }
          if (model.release_date >= '2025-11-13') {
            arr.unshift('none');
          }
          if (model.release_date >= '2025-12-04') {
            arr.push('xhigh');
          }
          return arr;
        });
        return Object.fromEntries(
          openaiEfforts.map(effort => [
            effort,
            {
              reasoningEffort: effort,
              reasoningSummary: 'auto',
              include: ['reasoning.encrypted_content']
            }
          ])
        );
      }

    case '@ai-sdk/anthropic':
    case '@ai-sdk/google-vertex/anthropic':
      if (isAnthropicAdaptive) {
        return Object.fromEntries(
          adaptiveEfforts.map(effort => [
            effort,
            { thinking: { type: 'adaptive' }, effort: effort }
          ])
        );
      }
      return {
        high: {
          thinking: {
            type: 'enabled',
            budgetTokens: Math.min(
              16_000,
              Math.floor(model.limit.output / 2 - 1)
            )
          }
        },
        max: {
          thinking: {
            type: 'enabled',
            budgetTokens: Math.min(31_999, model.limit.output - 1)
          }
        }
      };

    case '@ai-sdk/amazon-bedrock':
      if (isAnthropicAdaptive) {
        return Object.fromEntries(
          adaptiveEfforts.map(effort => [
            effort,
            {
              reasoningConfig: {
                type: 'adaptive',
                maxReasoningEffort: effort
              }
            }
          ])
        );
      }
      if (model.api.id.includes('anthropic')) {
        return {
          high: {
            reasoningConfig: { type: 'enabled', budgetTokens: 16000 }
          },
          max: {
            reasoningConfig: { type: 'enabled', budgetTokens: 31999 }
          }
        };
      }
      return Object.fromEntries(
        WIDELY_SUPPORTED_EFFORTS.map(effort => [
          effort,
          {
            reasoningConfig: {
              type: 'enabled',
              maxReasoningEffort: effort
            }
          }
        ])
      );

    case '@ai-sdk/google-vertex':
    case '@ai-sdk/google': {
      if (id.includes('2.5')) {
        return {
          high: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingBudget: 16000
            }
          },
          max: {
            thinkingConfig: {
              includeThoughts: true,
              thinkingBudget: 24576
            }
          }
        };
      }
      let levels = ['low', 'high'];
      if (id.includes('3.1')) {
        levels = ['low', 'medium', 'high'];
      }
      return Object.fromEntries(
        levels.map(effort => [
          effort,
          {
            thinkingConfig: {
              includeThoughts: true,
              thinkingLevel: effort
            }
          }
        ])
      );
    }

    case '@ai-sdk/mistral':
      return {};

    case '@ai-sdk/cohere':
      return {};

    case '@ai-sdk/groq': {
      const groqEffort = ['none', ...WIDELY_SUPPORTED_EFFORTS];
      return Object.fromEntries(
        groqEffort.map(effort => [effort, { reasoningEffort: effort }])
      );
    }

    case '@ai-sdk/perplexity':
      return {};

    case '@mymediset/sap-ai-provider':
    case '@jerome-benoit/sap-ai-provider-v2':
      if (model.api.id.includes('anthropic')) {
        return {
          high: {
            thinking: { type: 'enabled', budgetTokens: 16000 }
          },
          max: {
            thinking: { type: 'enabled', budgetTokens: 31999 }
          }
        };
      }
      return Object.fromEntries(
        WIDELY_SUPPORTED_EFFORTS.map(effort => [
          effort,
          { reasoningEffort: effort }
        ])
      );

    default:
      return {};
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Ported from external/opencode Provider.fromModelsDevModel
// Source: external/opencode/packages/opencode/src/provider/provider.ts
// ───────────────────────────────────────────────────────────────────────────────

export function fromModelsDevModel(
  provider: ModelsDevProvider,
  model: ModelsDevModel
): ProviderModel {
  const m: ProviderModel = {
    id: model.id,
    providerID: provider.id,
    name: model.name,
    family: model.family,
    api: {
      id: model.id,
      url: model.provider?.api ?? provider.api ?? '',
      npm: model.provider?.npm ?? provider.npm ?? '@ai-sdk/openai-compatible'
    },
    status: model.status ?? 'active',
    headers: model.headers ?? {},
    options: model.options ?? {},
    cost: {
      input: model.cost?.input ?? 0,
      output: model.cost?.output ?? 0,
      cache: {
        read: model.cost?.cache_read ?? 0,
        write: model.cost?.cache_write ?? 0
      },
      experimentalOver200K: model.cost?.context_over_200k
        ? {
            cache: {
              read: model.cost.context_over_200k.cache_read ?? 0,
              write: model.cost.context_over_200k.cache_write ?? 0
            },
            input: model.cost.context_over_200k.input,
            output: model.cost.context_over_200k.output
          }
        : undefined
    },
    limit: {
      context: model.limit.context,
      input: model.limit.input,
      output: model.limit.output
    },
    capabilities: {
      temperature: model.temperature,
      reasoning: model.reasoning,
      attachment: model.attachment,
      toolcall: model.tool_call,
      input: {
        text: model.modalities?.input?.includes('text') ?? false,
        audio: model.modalities?.input?.includes('audio') ?? false,
        image: model.modalities?.input?.includes('image') ?? false,
        video: model.modalities?.input?.includes('video') ?? false,
        pdf: model.modalities?.input?.includes('pdf') ?? false
      },
      output: {
        text: model.modalities?.output?.includes('text') ?? false,
        audio: model.modalities?.output?.includes('audio') ?? false,
        image: model.modalities?.output?.includes('image') ?? false,
        video: model.modalities?.output?.includes('video') ?? false,
        pdf: model.modalities?.output?.includes('pdf') ?? false
      },
      interleaved: model.interleaved ?? false
    },
    release_date: model.release_date,
    variants: {}
  };

  m.variants = mapObjectValues(variants(m), v => v);

  return m;
}

// ───────────────────────────────────────────────────────────────────────────────
// Ported from external/opencode Provider.fromModelsDevProvider
// Source: external/opencode/packages/opencode/src/provider/provider.ts
// ───────────────────────────────────────────────────────────────────────────────

export function fromModelsDevProvider(provider: ModelsDevProvider): {
  id: string;
  name: string;
  models: Record<string, ProviderModel>;
} {
  return {
    id: provider.id,
    name: provider.name,
    models: mapObjectValues(provider.models, model =>
      fromModelsDevModel(provider, model)
    )
  };
}
