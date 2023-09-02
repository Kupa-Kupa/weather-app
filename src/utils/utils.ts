function convertToCoordinates(num: number, direction: string): string {
  const degrees = Math.trunc(num);

  const minFloat =
    Number(
      String(num)
        .split('.')
        .map((x, index) => (index == 0 ? 0 : x))
        .join('.')
    ) * 60;

  const minutes = Math.trunc(minFloat);

  const secFloat =
    Number(
      String(minFloat)
        .split('.')
        .map((x, index) => (index == 0 ? 0 : x))
        .join('.')
    ) * 60;

  const seconds = secFloat.toFixed(1);

  if (degrees < 0) {
    if (direction == 'lat') {
      return `${Math.abs(degrees)}°${minutes}'${seconds}"S`;
    } else {
      return `${Math.abs(degrees)}°${minutes}'${seconds}"W`;
    }
  } else {
    if (direction == 'lat') {
      return `${degrees}°${minutes}'${seconds}"N`;
    } else {
      return `${degrees}°${minutes}'${seconds}"E`;
    }
  }
}

export { convertToCoordinates };
