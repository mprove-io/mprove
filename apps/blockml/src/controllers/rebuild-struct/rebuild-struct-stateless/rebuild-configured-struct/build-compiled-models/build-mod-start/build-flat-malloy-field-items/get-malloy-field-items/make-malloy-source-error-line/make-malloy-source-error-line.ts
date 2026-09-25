import type { ConfigService } from '@nestjs/config';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import type { MalloySourceField } from '#blockml/types/malloy-source-field';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';

export type MakeMalloySourceErrorLineOutput = {
  line: number;
  name: string;
  path: string;
};

export function makeMalloySourceErrorLine(item: {
  sourceField: MalloySourceField | undefined;
  fileName: string;
  filePath: string;
  cs: ConfigService<BlockmlConfig>;
}) {
  let sourceFieldLine = item.sourceField?.location?.range?.start?.line;
  let line = isDefined(sourceFieldLine) ? sourceFieldLine + 1 : 0;

  let sourceUrl = item.sourceField?.location?.url;
  let sourceUrlIsUndefined = isUndefined(sourceUrl);

  if (sourceUrlIsUndefined) {
    return {
      line: line,
      name: item.fileName,
      path: item.filePath
    };
  }

  let blockmlDataPath =
    item.cs.get<BlockmlConfig['blockmlData']>('blockmlData');

  blockmlDataPath = blockmlDataPath.endsWith('/')
    ? blockmlDataPath.slice(0, -1)
    : blockmlDataPath;

  let part = sourceUrl.split(blockmlDataPath)[1];
  let partIsUndefined = isUndefined(part);

  if (partIsUndefined) {
    return {
      line: line,
      name: item.fileName,
      path: item.filePath
    };
  }

  let partArray = part.split('/');

  partArray.shift();
  partArray.shift();

  let filePath = partArray.join('/');
  let fileName = partArray[partArray.length - 1];

  return {
    line: line,
    name: fileName,
    path: filePath
  };
}
