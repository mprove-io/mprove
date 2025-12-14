import type { Context, SpanOptions } from '@opentelemetry/api';
import { addTraceSpan } from '~node-common/functions/add-trace-span';

export const WithTraceSpan = (item?: {
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

    descriptor.value = async function (...args: any[]) {
      return await addTraceSpan({
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
