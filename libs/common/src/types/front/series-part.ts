import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SeriesPart = {
  seriesRowId: string;
  seriesRowName: string;
  seriesName: string;
  isMetric: boolean;
  showMetricsModelName: boolean;
  showMetricsTimeFieldName: boolean;
  partNodeLabel: string;
  partFieldLabel: string;
  timeNodeLabel: string;
  timeFieldLabel: string;
  topLabel: string;
};

export let zSeriesPart = z
  .object({
    seriesRowId: z.string(),
    seriesRowName: z.string(),
    seriesName: z.string(),
    isMetric: z.boolean(),
    showMetricsModelName: z.boolean(),
    showMetricsTimeFieldName: z.boolean(),
    partNodeLabel: z.string(),
    partFieldLabel: z.string(),
    timeNodeLabel: z.string(),
    timeFieldLabel: z.string(),
    topLabel: z.string()
  })
  .meta({ id: 'SeriesPart' });

assertTypesEqual<SeriesPart, z.infer<typeof zSeriesPart>>({ value: true });
