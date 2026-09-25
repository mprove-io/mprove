import {
  collectMalloySourceAnnotationValuesRecursive,
  type MalloyAnnotations
} from './collect-malloy-source-annotation-values-recursive/collect-malloy-source-annotation-values-recursive';

export function getMalloySourceAnnotationValues(item: {
  annotations?: MalloyAnnotations;
}): string[] {
  let { annotations } = item;

  let values: string[] = [];

  collectMalloySourceAnnotationValuesRecursive({
    annotations: annotations,
    values: values
  });

  return values;
}
