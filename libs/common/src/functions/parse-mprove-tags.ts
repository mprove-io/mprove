interface KeyValuePair {
  key: string;
  value: string;
}

export function parseMproveTags(item: {
  inputs: string[];
}): KeyValuePair[] {
  let { inputs } = item;

  let mproveTags: KeyValuePair[] = [];

  inputs.forEach(input => {
    const mproveMatch = input.match(/#\(mprove\)/);
    if (!mproveMatch) {
      return [];
    }

    let content = input.slice(mproveMatch.index + mproveMatch[0].length).trim();

    let pairRegex = /(\w+)=(?:"([^"]*)"|(\S+))/g;

    let match;

    while ((match = pairRegex.exec(content)) !== null) {
      const key = match[1];
      const value = match[2] !== undefined ? match[2] : match[3];
      mproveTags.push({ key, value });
    }
  });

  return mproveTags;
}
