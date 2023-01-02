export function secondsToMinuteString(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60 < 10 ? '0' : ''}${seconds % 60}s`;
}
