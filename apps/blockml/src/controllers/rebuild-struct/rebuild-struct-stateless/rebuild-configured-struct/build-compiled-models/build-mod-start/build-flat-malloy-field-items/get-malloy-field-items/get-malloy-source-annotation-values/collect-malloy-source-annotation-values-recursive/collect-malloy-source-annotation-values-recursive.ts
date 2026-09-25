import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export type MalloyAnnotations = {
  inherits?: MalloyAnnotations;
  blockNotes?: Array<{ text: string }>;
  notes?: Array<{ text: string }>;
};

export function collectMalloySourceAnnotationValuesRecursive(item: {
  annotations?: MalloyAnnotations;
  values: string[];
}): void {
  let { annotations, values } = item;

  if (isUndefined(annotations)) {
    return;
  }

  collectMalloySourceAnnotationValuesRecursive({
    annotations: annotations.inherits,
    values: values
  });

  annotations.blockNotes?.forEach(note => {
    values.push(note.text);
  });

  annotations.notes?.forEach(note => {
    values.push(note.text);
  });
}
