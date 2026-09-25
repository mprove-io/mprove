import path from 'node:path';
import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import type { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { decodeFilePath } from '#common/functions/decode-file-path/decode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BmlFile } from '#common/zod/blockml/bml-file';
import type { FileMod } from '#common/zod/blockml/internal/file-mod';

export async function prepareMalloyFile(item: {
  file: BmlFile;
  tempDir: string;
}): Result.ResultAsync<FileMod[], never> {
  let { file, tempDir } = item;

  let relativePath: string = isDefined(file.pathRelativeToRepo)
    ? file.pathRelativeToRepo
    : decodeFilePath({ filePath: file.path });

  file.blockmlPath = `${tempDir}/${relativePath}`;

  await fse.ensureDir(path.dirname(file.blockmlPath));

  await fse.writeFile(file.blockmlPath, file.content);

  let reg: RegExp = MyRegex.CAPTURE_MPROVE_MODELS();

  let capture: RegExpExecArray;

  let captures: string[] = [];

  while ((capture = reg.exec(file.content))) {
    captures.push(capture[1]);
  }

  let parts: string[] = file.name.split('.');

  let ext: string = parts[parts.length - 1];

  let mods: FileMod[] = captures.map(sourceName => ({
    fileName: file.name,
    fileExt: `.${ext}` as FileExtensionEnum, // malloy
    filePath: relativePath,
    name: sourceName,
    location: relativePath,
    blockmlPath: file.blockmlPath,
    source: sourceName,
    label: sourceName
      .split('_')
      .map(part => capitalizeFirstLetter(part))
      .join(' ')
  }));

  return Result.succeed(mods);
}
