import { trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator
} from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { LOCAL_STORAGE_TOKEN } from '#common/constants/top-front';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { environment } from '~front/environments/environment';

export function initTelemetry(): void {
  if (trace.getTracerProvider() instanceof WebTracerProvider) {
    console.warn('OpenTelemetry already initialized');
    return;
  }

  let resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'mprove-front'
  });

  let traceExporter = new OTLPTraceExporter({
    url: `${environment.httpUrl}/${ToBackendRequestInfoNameEnum.ToBackendTelemetryTraces}`,
    headers: async () => {
      let token = localStorage.getItem(LOCAL_STORAGE_TOKEN);
      return { Authorization: `Bearer ${token}` };
    }
  });

  let traceProvider = new WebTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)]
  });

  traceProvider.register({
    contextManager: new ZoneContextManager(),
    propagator: new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
    })
  });

  registerInstrumentations({
    tracerProvider: traceProvider,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-document-load': {},
        '@opentelemetry/instrumentation-user-interaction': {
          enabled: false
        },
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: [new RegExp(environment.httpUrl)]
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: [new RegExp(environment.httpUrl)]
        }
      })
    ]
  });
}
