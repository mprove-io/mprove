// import { metrics } from '@opentelemetry/api';
// import { performance } from 'perf_hooks';

// let meter = metrics.getMeter('default');

// export async function addDurationMetric<T>(item: {
//   fn: () => Promise<T>;
//   metricName?: string;
//   labels?: Record<string, string | number | boolean>;
// }): Promise<T> {
//   let { fn, metricName = 'duration.ms', labels = {} } = item;

//   let histogram = meter.createHistogram(metricName, {
//     description: `Duration for ${metricName}`,
//     unit: 'ms',
//   });

//   let start = performance.now();

//   try {
//     return await fn();
//   } finally {
//     let duration = performance.now() - start;
//     histogram.record(duration, labels);
//   }
// }
