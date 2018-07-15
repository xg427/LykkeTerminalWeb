enum OrderType {
  Market = 'Market',
  Limit = 'Limit',
  StopLimit = 'Stop Limit'
}

enum OrderInputs {
  Price = 'priceValue',
  Amount = 'amountValue',
  StopLimitPrice = 'stopLimitPriceValue'
}

enum OrderStatus {
  Cancelled = 'Cancelled',
  Matched = 'Matched',
  Placed = 'InOrderBook',
  Processing = 'Processing',
  Rejected = 'Rejected'
}

export {OrderType, OrderInputs, OrderStatus};
