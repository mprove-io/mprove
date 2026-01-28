// import { addDurationMetric } from '#node-common/functions/add-duration-metric';

// export const WithDurationMetric = (item?: {
//   metricName?: string;
//   labels?: Record<string, string | number | boolean>;
// }) => {
//   let { metricName, labels } = item || {};

//   return function (
//     target: any,
//     propertyKey: string,
//     descriptor: PropertyDescriptor
//   ) {
//     let originalMethod = descriptor.value;
//     let className = target.constructor.name;

//     descriptor.value = async function (...args: any[]) {
//       return await addDurationMetric({
//         fn: () => {
//           return originalMethod.apply(this, args);
//         },
//         metricName: metricName || `${propertyKey}.duration.ms`,
//         labels: {
//           class: className,
//           method: propertyKey,
//           ...labels,
//         },
//       });
//     };

//     return descriptor;
//   };
// };
