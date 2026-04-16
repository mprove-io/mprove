import type { FileDashboard } from '#common/zod/blockml/internal/file-dashboard';
import type { FileReport } from '#common/zod/blockml/internal/file-report';
import type { FileStore } from '#common/zod/blockml/internal/file-store';

export type sdrType = FileStore | FileDashboard | FileReport;
