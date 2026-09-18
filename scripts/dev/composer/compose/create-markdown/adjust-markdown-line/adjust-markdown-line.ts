export type MarkdownAdjustmentState = {
  openFenceCharacter: string;
  openFenceLength: number;
};

export function adjustMarkdownLine(item: {
  line: string;
  nestingLevel: number;
  state: MarkdownAdjustmentState;
}): string {
  let { line, nestingLevel, state } = item;

  let indentationLength: number = 0;

  let indentationColumns: number = 0;

  while (indentationLength < line.length) {
    let indentationCharacter: string = line[indentationLength];

    let isTab: boolean = indentationCharacter === '\t';

    if (indentationCharacter !== ' ' && !isTab) {
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

  let isBeginningFence: boolean =
    indentationColumns <= 3 &&
    fenceMatch !== null &&
    !(fenceCharacter === '`' && fenceRemainder.includes('`'));

  if (state.openFenceLength > 0) {
    let trimmedFenceRemainder: string = fenceRemainder.trim();

    if (
      isBeginningFence &&
      fenceCharacter === state.openFenceCharacter &&
      fenceLength >= state.openFenceLength &&
      trimmedFenceRemainder.length === 0
    ) {
      state.openFenceCharacter = '';

      state.openFenceLength = 0;
    }

    return line;
  }

  if (isBeginningFence) {
    state.openFenceCharacter = fenceCharacter;

    state.openFenceLength = fenceLength;

    return line;
  }

  let headingMatch: RegExpMatchArray | null =
    leftTrimmedLine.match(/^(#{1,6})(?=$|[ \t])/u);

  if (indentationColumns <= 3 && headingMatch !== null) {
    let headingMarker: string = headingMatch[1];

    let headingLength: number = headingMarker.length;

    let adjustedHeadingLength: number = Math.min(
      6,
      headingLength + nestingLevel
    );

    let adjustedHeadingPrefix: string = '#'.repeat(adjustedHeadingLength);

    let headingIndentation: string = line.slice(0, indentationLength);

    let headingContent: string = leftTrimmedLine.slice(headingLength);

    let adjustedLine: string = `${headingIndentation}${adjustedHeadingPrefix}${headingContent}`;

    return adjustedLine;
  }

  return line;
}
