import { IsString } from 'class-validator';

export class CatalogItemFile {
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
  fileAbsoluteId: string;
  // "/mprove_m_data/m-disk/organizations/o5/p1/rbobert/ec/s.view"

  @IsString()
  name: string;
  // "s.view"

  @IsString()
  content: string;
}
