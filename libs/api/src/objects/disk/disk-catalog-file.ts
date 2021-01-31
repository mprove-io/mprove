import { IsString } from 'class-validator';

export class DiskCatalogFile {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  fileId: string;
  // "ec___s.view"

  @IsString()
  pathString: string;
  // "[\"p1\",\"ec\",\"s.view\"]",

  @IsString()
  fileNodeId: string;
  // "p1/rbobert/ec/s.view"

  @IsString()
  name: string;
  // "s.view"

  @IsString()
  content: string;
}
