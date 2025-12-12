import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export function startTracer(item: {
  serviceName: string;
  hyperdxIngestionApiKey: string;
}) {
  let { serviceName, hyperdxIngestionApiKey } = item;

  let traceExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      'http://localhost:4318/v1/traces',
    headers: {
      Authorization: hyperdxIngestionApiKey
    }
  });

  let tracerNodeSdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName
    }),
    traceExporter,
    instrumentations: [
      // node_modules/@opentelemetry/auto-instrumentations-node/build/src/utils.d.ts
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-amqplib': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-ioredis': { enabled: true },
        '@opentelemetry/instrumentation-redis': { enabled: true },
        '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
        //
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-mysql2': { enabled: false },
        '@opentelemetry/instrumentation-mysql': { enabled: false },
        '@opentelemetry/instrumentation-pg': { enabled: false },
        '@opentelemetry/instrumentation-winston': { enabled: false }
      })
    ]
  });

  tracerNodeSdk.start();

  return tracerNodeSdk;
}
