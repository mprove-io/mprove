import {
  Context,
  context,
  SpanOptions,
  SpanStatusCode,
  trace
} from '@opentelemetry/api';

let tracer = trace.getTracer('default');

export async function addTraceSpan<T>(item: {
  fn: () => Promise<T>;
  spanName: string;
  spanOptions?: SpanOptions;
  spanContext?: Context;
}): Promise<T> {
  let { fn, spanName, spanOptions, spanContext } = item;

  let parentContext = spanContext ?? context.active();

  let span = tracer.startSpan(spanName, spanOptions, parentContext);

  let executionContext = trace.setSpan(parentContext, span);

  return await context.with(executionContext, async () => {
    try {
      let result = await fn();

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
