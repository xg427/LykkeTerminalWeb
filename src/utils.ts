export const capitalize = (str: string | undefined | null) =>
  str ? str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase() : '';

export const normalizeVolume = (
  minVolume: number,
  maxVolume: number,
  volume: number
) => {
  const minp = 10;
  const maxp = 100;

  if (volume === minVolume && volume === maxVolume) {
    return maxp;
  }

  if (volume === minVolume && minVolume !== maxVolume) {
    return minp;
  }

  if (volume === maxVolume && minVolume !== maxVolume) {
    return maxp;
  }

  const minv = Math.log(minVolume);
  const maxv = Math.log(maxVolume);

  const scale = (maxv - minv) / (maxp - minp);
  return (Math.log(volume) - minv) / scale + minp;
};

export const nextSkip = (skip: number, take: number, skipWamp: number) => {
  return skip + take + skipWamp;
};

export const plural = (w: string, count: number) =>
  count > 1 ? w.concat('s') : w;
