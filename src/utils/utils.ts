function convertToCoordinates(num: number, direction: string): string {
  console.log('convertToCoordinates');
  console.log('Incoming num', num);

  const degrees = Math.trunc(num);
  console.log('degrees', degrees);

  const minFloat =
    Number(
      String(num)
        .split('.')
        .map((x, index) => (index == 0 ? 0 : x))
        .join('.')
    ) * 60;
  console.log('minFloat', minFloat);

  const minutes = Math.trunc(minFloat);
  console.log('minutes', minutes);

  const secFloat =
    Number(
      String(minFloat)
        .split('.')
        .map((x, index) => (index == 0 ? 0 : x))
        .join('.')
    ) * 60;
  console.log('secFloat', secFloat);

  const seconds = secFloat.toFixed(1);
  console.log('seconds', seconds);

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
