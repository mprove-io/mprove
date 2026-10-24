export function makeOcEventFullId(item: {
  sessionId: string;
  eventIndex: number;
}): string {
  return `${item.sessionId}_${item.eventIndex}`;
}
