export function dist([x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

export function flatten(array) {
  const arrayCopy = [...array];
  return arrayCopy.reduce((acc, curr) => acc.concat(curr), []);
}

export function sort(array) {
  // Create a copy of the array using the spread operator
  const arrayCopy = [...array];
  return arrayCopy.sort((a, b) => a - b);
}

export function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function pointAtDistance([lon, lat], d, bearing) {
  let r = 6371;
  let lat1 = toRadians(lat);
  let lon1 = toRadians(lon);
  let a = toRadians(bearing);
  let lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d / r) +
      Math.cos(lat1) * Math.sin(d / r) * Math.cos(a)
  );
  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(a) * Math.sin(d / r) * Math.cos(lat1),
      Math.cos(d / r) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [toDegrees(lat2), toDegrees(lon2)];
}

export function arrayAvg(array) {
  if (array.length === 0) {
    return 0; // Avoid division by zero
  }
  const sum = array.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return sum / array.length;
}

export const fractionalPart = (number) => {
  return number - Math.floor(number);
};

const PHI = (1 + Math.sqrt(5)) / 2;

export const fibonacciLattice = (n) => {
  return [...Array(n).keys()].map((i) => [
    fractionalPart(i / PHI),
    n == 1 ? 0 : i / (n - 1),
  ]);
};
