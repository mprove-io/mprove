export function adjustMarkdownHeadings(item: {
  content: string;
  nestingLevel: number;
}): string {
  let { content, nestingLevel } = item;

  let lines: string[] = content.split(/\r?\n/u);

  let adjustedLines: string[] = [];

  let openFenceCharacter: string = '';

  let openFenceLength: number = 0;

  for (let i = 0; i < lines.length; i++) {
    let line: string = lines[i];

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

    let fenceCharacter: string = leftTrimmedLine[0] ?? '';

    let fenceLength: number = 0;

    while (leftTrimmedLine[fenceLength] === fenceCharacter) {
      fenceLength++;
    }

    let fenceRemainder: string = leftTrimmedLine.slice(fenceLength);

    let isFenceCharacter: boolean =
      fenceCharacter === '`' || fenceCharacter === '~';

    let backtickInfoContainsBacktick: boolean =
      fenceCharacter === '`' && fenceRemainder.includes('`');

    let beginsFence: boolean =
      indentationColumns <= 3 &&
      isFenceCharacter &&
      fenceLength >= 3 &&
      !backtickInfoContainsBacktick;

    let isInsideFence: boolean = openFenceLength > 0;

    if (isInsideFence) {
      adjustedLines.push(line);

      let trimmedFenceRemainder: string = fenceRemainder.trim();

      let closesFence: boolean =
        beginsFence &&
        fenceCharacter === openFenceCharacter &&
        fenceLength >= openFenceLength &&
        trimmedFenceRemainder.length === 0;

      if (closesFence) {
        openFenceCharacter = '';

        openFenceLength = 0;
      }

      continue;
    }

    if (beginsFence) {
      openFenceCharacter = fenceCharacter;

      openFenceLength = fenceLength;

      adjustedLines.push(line);

      continue;
    }

    let isSetextH1: boolean = /^ {0,3}=+\s*$/u.test(line);

    let isSetextH2: boolean = /^ {0,3}-+\s*$/u.test(line);

    let isSetextHeading: boolean = isSetextH1 || isSetextH2;

    let shouldAdjustSetextHeading: boolean =
      isSetextHeading && nestingLevel > 0;

    if (shouldAdjustSetextHeading) {
      let paragraphStartIndex: number = adjustedLines.length;

      for (let j = adjustedLines.length - 1; j >= 0; j--) {
        let candidateLine: string = adjustedLines[j];

        let trimmedCandidateLine: string = candidateLine.trim();

        let isBlankLine: boolean = trimmedCandidateLine.length === 0;

        let beginsBlock: boolean =
          /^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|[-+*][ \t]+|\d+[.)][ \t]+|`{3,}|~{3,}|<)/u.test(
            candidateLine
          ) || /^ {4}/u.test(candidateLine);

        let isParagraphLine: boolean = !isBlankLine && !beginsBlock;

        if (!isParagraphLine) {
          break;
        }

        paragraphStartIndex = j;
      }

      let hasParagraph: boolean = paragraphStartIndex < adjustedLines.length;

      if (hasParagraph) {
        let paragraphLines: string[] = adjustedLines.slice(paragraphStartIndex);

        let title: string = paragraphLines.map(value => value.trim()).join(' ');

        let baseLevel: number = isSetextH1 ? 1 : 2;

        let headingLevel: number = Math.min(6, baseLevel + nestingLevel);

        let headingPrefix: string = '#'.repeat(headingLevel);

        adjustedLines.splice(
          paragraphStartIndex,
          paragraphLines.length,
          `${headingPrefix} ${title}`
        );

        continue;
      }
    }

    let headingLength: number = 0;

    while (
      headingLength < leftTrimmedLine.length &&
      leftTrimmedLine[headingLength] === '#'
    ) {
      headingLength++;
    }

    let characterAfterHeading: string = leftTrimmedLine[headingLength] ?? '';

    let hasValidHeadingIndentation: boolean = indentationColumns <= 3;

    let isAtxHeading: boolean =
      hasValidHeadingIndentation &&
      headingLength > 0 &&
      headingLength <= 6 &&
      (characterAfterHeading === '' ||
        characterAfterHeading === ' ' ||
        characterAfterHeading === '\t');

    if (isAtxHeading) {
      let adjustedHeadingLength: number = Math.min(
        6,
        headingLength + nestingLevel
      );

      let adjustedHeadingPrefix: string = '#'.repeat(adjustedHeadingLength);

      let headingIndentation: string = line.slice(0, indentationLength);

      let headingContent: string = leftTrimmedLine.slice(headingLength);

      adjustedLines.push(
        `${headingIndentation}${adjustedHeadingPrefix}${headingContent}`
      );

      continue;
    }

    adjustedLines.push(line);
  }

  let adjustedContent: string = adjustedLines.join('\n');

  return adjustedContent;
}
