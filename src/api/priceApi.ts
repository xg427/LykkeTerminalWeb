import {RestApi} from './index';
import {candleMocks} from './mocks/candles';

class PriceApi extends RestApi {
  fetchCandles = (instrument: string, from: Date, to: Date, interval: string) =>
    this.get(
      `/candlesHistory/spot/${instrument}/trades/${interval}/${from.toISOString()}/${to.toISOString()}`
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
      resp = {History: []};
    }

    return resp;
  };
}

export default PriceApi;
