import {RestApi} from './index';
import {candleMocks} from './mocks/candles';

class PriceApi extends RestApi {
  fetchCandles = (instrument: string, from: Date, to: Date, interval: string) =>
    this.get(
      `/candlesHistory/spot/${instrument}/trades/${interval}/${from.toISOString()}/${to.toISOString()}`
    );

  fetchBitfinexCandles = (from: number, to: number) =>
    this.customGet(
      `https://api.bitfinex.com/v2/candles/trade:1m:tBTCUSD/hist?start=${from}&end=${to}&limit=1000`
    );

  fetchCandlesMock = (
    instrument: string,
    from: Date,
    to: Date,
    interval: string
  ) => {
    let resp: any;

    if (
      candleMocks[instrument.toLowerCase()] &&
      candleMocks[instrument.toLowerCase()][interval]
    ) {
      resp = {History: candleMocks[instrument.toLowerCase()][interval]};
    } else {
      resp = {
        History: [
          [1527811200, 5575, 5718.17, 5541.04, 5687.96, 97.514915, 552254.1]
        ]
      };
    }

    return resp;
  };
}

export default PriceApi;
