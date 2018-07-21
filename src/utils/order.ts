import {Side} from '../models';
import {getPercentsOf, precisionFloor} from './math';

export const getPercentOfValueForLimit = (
  getPriceValue: () => string,
  getAmountAccuracy: () => number,
  percents: number,
  value: number,
  side: Side
) => {
  if (side === Side.Sell) {
    return getPercentsOf(percents, value, getAmountAccuracy());
  }
  return getPercentsOf(
    percents,
    value / parseFloat(getPriceValue()),
    getAmountAccuracy()
  );
};

export const isAmountExceedLimitBalance = (
  isSell: boolean,
  amountValue: string,
  priceValue: string,
  mainAssetBalance: number,
  priceAccuracy: number,
  amountAccuracy: number
) =>
  isSell
    ? +amountValue > mainAssetBalance
    : parseFloat(priceValue) *
        precisionFloor(parseFloat(amountValue), amountAccuracy) >
      mainAssetBalance;

export const setActivePercentage = (percentage: any[], index?: number) => {
  let percents: number = 0;

  if (index === undefined) {
    percents = 100;
  }

  percentage.forEach((item: any, i: number) => {
    if (index === i) {
      item.isActive = true;
      percents = item.percent;
    } else {
      item.isActive = false;
    }
  });

  return {
    percents,
    updatedPercentage: percentage
  };
};

export const resetPercentage = (percentage: any[]) => {
  percentage.forEach((item: any) => {
    item.isActive = false;
  });
};
