import type { Context, SpanOptions } from '@opentelemetry/api';
import { addTraceSpanSync } from '#node-common/functions/add-trace-span-sync';

export const WithTraceSpanSync = (item?: {
  spanName?: string;
  spanOptions?: SpanOptions;
  spanContext?: Context;
}) => {
  let { spanName, spanOptions, spanContext } = item || {};

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    let originalMethod = descriptor.value;
    let className = target.constructor.name;

    descriptor.value = function (...args: any[]) {
      return addTraceSpanSync({
        fn: () => {
          return originalMethod.apply(this, args);
        },
        spanName: spanName || `${className}.${propertyKey}`,
        spanOptions: spanOptions,
        spanContext: spanContext
      });
    };

    return descriptor;
  };
};
