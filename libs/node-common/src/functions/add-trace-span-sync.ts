import {
  Context,
  SpanOptions,
  SpanStatusCode,
  context,
  trace
} from '@opentelemetry/api';

let tracer = trace.getTracer('default');

export function addTraceSpanSync<T>(item: {
  fn: () => T;
  spanName: string;
  spanOptions?: SpanOptions;
  spanContext?: Context;
}): T {
  let { fn, spanName, spanOptions, spanContext } = item;

  let parentContext = spanContext ?? context.active();

  let span = tracer.startSpan(spanName, spanOptions, parentContext);

  let executionContext = trace.setSpan(parentContext, span);

  return context.with(executionContext, () => {
    try {
      let result = fn();

      // span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (e) {
      let message = e instanceof Error ? e.message : 'Unknown error';

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message
      });

      span.recordException(e instanceof Error ? e : String(e));

      throw e;
    } finally {
      span.end();
    }
  });
}
