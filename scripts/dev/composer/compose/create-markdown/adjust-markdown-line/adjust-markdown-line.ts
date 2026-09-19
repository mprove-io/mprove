export function adjustMarkdownLine(item: {
  line: string;
  nestingLevel: number;
}): string {
  let { line, nestingLevel } = item;

  let headingMatch: RegExpMatchArray | null =
    line.match(/^(#{1,6})(?=$|[ \t])/u);

  if (headingMatch !== null) {
    let headingMarker: string = headingMatch[1];

    let headingLength: number = headingMarker.length;

    let adjustedHeadingLength: number = Math.min(
      6,
      headingLength + nestingLevel
    );

    let adjustedHeadingPrefix: string = '#'.repeat(adjustedHeadingLength);

    let headingContent: string = line.slice(headingLength);

    let adjustedLine: string = `${adjustedHeadingPrefix}${headingContent}`;

    return adjustedLine;
  }

  return line;
}
