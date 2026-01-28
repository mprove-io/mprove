import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
// import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
// import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

export function startTelemetry(item: { serviceName: string }) {
  let { serviceName } = item;

  let url = process.env.TELEMETRY_ENDPOINT;

  if (process.env.IS_TELEMETRY_ENABLED !== 'TRUE') {
    console.log('Telemetry disabled via IS_TELEMETRY_ENABLED env var');
    return null;
  }

  let traceExporter = new OTLPTraceExporter({
    url: `${url}/v1/traces`,
    headers: {
      Authorization: process.env.TELEMETRY_HYPERDX_INGEST_API_KEY
    }
  });

  // let metricExporter = new OTLPMetricExporter({
  //   url: `${url}/v1/metrics`,
  //   headers: {
  //     Authorization: hyperdxIngestionApiKey
  //   }
  // });

  // let metricReader = new PeriodicExportingMetricReader({
  //   exporter: metricExporter,
  //   exportIntervalMillis: 10_000
  // });

  let telemetryNodeSdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName
    }),
    traceExporter,
    // metricReader,
    instrumentations: [
      // node_modules/@opentelemetry/auto-instrumentations-node/build/src/utils.d.ts
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-amqplib': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-ioredis': { enabled: true },
        '@opentelemetry/instrumentation-redis': { enabled: true },
        //
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-mysql2': { enabled: false },
        '@opentelemetry/instrumentation-mysql': { enabled: false },
        '@opentelemetry/instrumentation-nestjs-core': { enabled: false },
        '@opentelemetry/instrumentation-pg': { enabled: false },
        '@opentelemetry/instrumentation-winston': { enabled: false }
      })
    ]
  });

  telemetryNodeSdk.start();

  return telemetryNodeSdk;
}
