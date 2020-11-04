import * as apiObjects from '../../objects/_index';

export class SwError {
  projectId: string;
  repoId: string;
  structId: string;
  errorId: string;
  type: string;
  message: string;
  lines: apiObjects.DiskFileLine[];
  serverTs: number;
}
