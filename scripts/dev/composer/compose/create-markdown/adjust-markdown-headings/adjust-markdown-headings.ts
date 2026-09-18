import { Result } from '@praha/byethrow';

export function adjustMarkdownHeadings(item: {
  content: string;
  nestingLevel: number;
}): Result.Result<string, never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'lines',
      (v): Result.Result<string[], never> =>
        Result.succeed(v.content.split(/\r?\n/u))
    ),
    Result.bind(
      'adjustedLines',
      (v): Result.Result<string[], never> => Result.succeed(v.lines.slice(0, 0))
    ),
    Result.bind(
      'openFenceCharacter',
      (v): Result.Result<string, never> =>
        Result.succeed(v.adjustedLines.join(''))
    ),
    Result.bind(
      'openFenceLength',
      (v): Result.Result<number, never> =>
        Result.succeed(v.adjustedLines.length)
    ),
    Result.andThrough(v =>
      Result.sequence(v.lines, (line): Result.Result<void, never> => {
        let indentationLength: number = 0;

        let indentationColumns: number = 0;

        while (indentationLength < line.length) {
          let indentationCharacter: string = line[indentationLength];

          let isSpace: boolean = indentationCharacter === ' ';

          let isTab: boolean = indentationCharacter === '\t';

          let isIndentation: boolean = isSpace || isTab;

          if (!isIndentation) {
            break;
          }

          indentationLength++;

          indentationColumns = isTab
            ? indentationColumns + (4 - (indentationColumns % 4))
            : indentationColumns + 1;
        }

        let leftTrimmedLine: string = line.slice(indentationLength);

        let fenceMatch: RegExpMatchArray | null =
          leftTrimmedLine.match(/^(`{3,}|~{3,})(.*)$/u);

        let fenceMarker: string = fenceMatch?.[1] ?? '';

        let fenceCharacter: string = fenceMarker[0] ?? '';

        let fenceLength: number = fenceMarker.length;

        let fenceRemainder: string = fenceMatch?.[2] ?? '';

        let isBacktickInfoContainingBacktick: boolean =
          fenceCharacter === '`' && fenceRemainder.includes('`');

        let isBeginningFence: boolean =
          indentationColumns <= 3 &&
          fenceMatch !== null &&
          !isBacktickInfoContainingBacktick;

        let isInsideFence: boolean = v.openFenceLength > 0;

        if (isInsideFence) {
          v.adjustedLines.push(line);

          let trimmedFenceRemainder: string = fenceRemainder.trim();

          let isClosingFence: boolean =
            isBeginningFence &&
            fenceCharacter === v.openFenceCharacter &&
            fenceLength >= v.openFenceLength &&
            trimmedFenceRemainder.length === 0;

          if (isClosingFence) {
            v.openFenceCharacter = '';

            v.openFenceLength = 0;
          }

          return Result.succeed();
        }

        if (isBeginningFence) {
          v.openFenceCharacter = fenceCharacter;

          v.openFenceLength = fenceLength;

          v.adjustedLines.push(line);

          return Result.succeed();
        }

        let headingMatch: RegExpMatchArray | null =
          leftTrimmedLine.match(/^(#{1,6})(?=$|[ \t])/u);

        if (indentationColumns <= 3 && headingMatch !== null) {
          let headingMarker: string = headingMatch[1];

          let headingLength: number = headingMarker.length;

          let adjustedHeadingLength: number = Math.min(
            6,
            headingLength + v.nestingLevel
          );

          let adjustedHeadingPrefix: string = '#'.repeat(adjustedHeadingLength);

          let headingIndentation: string = line.slice(0, indentationLength);

          let headingContent: string = leftTrimmedLine.slice(headingLength);

          v.adjustedLines.push(
            `${headingIndentation}${adjustedHeadingPrefix}${headingContent}`
          );

          return Result.succeed();
        }

        v.adjustedLines.push(line);

        return Result.succeed();
      })
    ),
    Result.map((v): string => v.adjustedLines.join('\n'))
  );
}
