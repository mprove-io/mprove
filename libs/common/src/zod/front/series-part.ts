import { z } from 'zod';

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

export type SeriesPart = z.infer<typeof zSeriesPart>;
