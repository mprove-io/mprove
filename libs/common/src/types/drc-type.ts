import type { FileChart } from '#common/zod/blockml/internal/file-chart';
import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FileReport } from '#common/zod/blockml/internal/file-report';

export type drcType = FileDashboard | FileReport | FileChart;
