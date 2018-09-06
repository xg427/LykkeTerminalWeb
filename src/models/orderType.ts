enum OrderType {
  Market = 'Market',
  Limit = 'Limit',
  StopLimit = 'StopLimit'
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

enum OrderTitle {
  Market = 'Market',
  Limit = 'Limit',
  StopLimit = 'Stop Limit'
}

export {OrderType, OrderInputs, OrderStatus, OrderTitle};
