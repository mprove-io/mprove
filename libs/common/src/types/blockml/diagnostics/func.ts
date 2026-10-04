import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const funcValues = [
  'ALL',

  'build-chart/check-chart-tiles-exist',
  'build-chart/check-chart-access',
  'build-chart/make-chart-access-roles-combined',

  'build-dashboard/check-dashboard-access',
  'build-dashboard/check-dashboard-top-parameters',
  'build-dashboard/check-dashboard-filter-conditions',
  'build-dashboard/check-dashboard-tiles-exist',
  'build-dashboard/make-dashboard-access-roles-combined',

  'build-field/check-fields-exist',
  'build-field/check-parameters-exist',
  'build-field/check-field-is-object',
  'build-field/check-field-declaration',
  'build-field/check-sql-exist',
  'build-field/check-field-name-duplicates',
  'build-field/check-field-unknown-parameters',
  'build-field/set-implicit-label',
  'build-field/check-dimensions',
  'build-field/transform-yesno-dimensions',
  'build-field/check-measures',
  'build-field/check-calculations',
  'build-field/check-and-set-implicit-result',
  'build-field/check-store-field-group',
  'build-field/check-store-field-detail',
  'build-field/check-and-set-implicit-format-number',
  'build-field/transform-times',
  'build-field/make-fields-deps',
  'build-field/check-fields-deps',
  'build-field/check-cycles',
  'build-field/substitute-single-refs',

  'build-mconfig-chart/check-chart-type',
  'build-mconfig-chart/check-chart-data',
  'build-mconfig-chart/check-chart-data-parameters',
  'build-mconfig-chart/check-chart-plate-parameters',
  'build-mconfig-chart/check-chart-options-parameters',
  'build-mconfig-chart/check-chart-options-x-axis-parameters',
  'build-mconfig-chart/check-chart-options-y-axis-parameters',
  'build-mconfig-chart/check-chart-options-series-parameters',

  'build-metrics-next/create-model-metrics',

  'build-mod-start/build-malloy-model',
  'build-mod-start/build-mods',
  'build-mod-start/build-flat-malloy-field-items',
  'build-mod-start/check-mod-spaces',
  'build-mod-start/check-timeframes',
  'build-mod-start/check-build-metrics-field-groups',

  'build-report/check-report',
  'build-report/check-report-access',
  'build-report/check-report-top-parameters',
  'build-report/check-report-filter-conditions',
  'build-report/check-report-row-unknown-parameters',
  'build-report/check-report-row-unknown-params',
  'build-report/check-report-row',
  'build-report/check-report-row-ids',
  'build-report/check-report-row-parameters',
  'build-report/make-report-access-roles-combined',
  'build-report/build-report-row-parameter-fractions',

  'build-store-next/check-store-build-metrics',
  'build-store-next/check-store-build-metric-details',
  'build-store-next/check-store-required-parameters',
  'build-store-next/check-store-spaces',

  'build-store-start/apply-store-presets',
  'build-store-start/check-store-field-groups',
  'build-store-start/check-store-field-time-groups',
  'build-store-start/check-store-results',
  'build-store-start/check-result-fraction-types',

  'build-tile/check-tile-is-object',
  'build-tile/check-tile-unknown-parameters',
  'build-tile/check-tile-title-model-select',
  'build-tile/check-select-elements',
  'build-tile/check-sorts',
  'build-tile/check-limit',
  'build-tile/check-tile-parameters',
  'build-tile/fetch-sql',

  'build-yaml/remove-wrong-ext',
  'build-yaml/deduplicate-file-names',
  'build-yaml/yaml-to-objects',
  'build-yaml/make-line-numbers',
  'build-yaml/check-top-unknown-parameters',
  'build-yaml/check-top-values',
  'build-yaml/check-connections',
  'build-yaml/check-support-udfs',
  'build-yaml/split-files',
  'build-yaml/check-project-config',
  'build-yaml/check-schema',
  'build-spaces/check-space-folders',
  'build-spaces/check-space-parents',
  'build-spaces/build-space-full-titles',
  'build-spaces/build-space-access-roles',

  'extra/collect-files',
  'extra/check-access',
  'extra/check-filter-conditions',
  'extra/check-mprove-explorer',
  'extra/check-store-fraction',
  'extra/check-store-fraction-controls',
  'extra/check-store-fraction-controls-use',
  'extra/check-store-fraction-control-options',
  'extra/check-suggest-model-dimension',
  'extra/check-model-name',
  'extra/make-file-part-spaces',
  'extra/log-struct'
] as const;

export type Func = (typeof funcValues)[number];

export let zFunc = z.enum(funcValues);

assertTypesEqual<Func, z.infer<typeof zFunc>>({
  value: true
});
