import {HBar} from '@lykkex/react-components';
import * as React from 'react';
import {AnalyticsEvents} from '../../constants/analyticsEvents';
import place from '../../constants/places';
import {OrderModel, OrderType, SortDirection} from '../../models';
import {AnalyticsService} from '../../services/analyticsService';
import {EditOrder} from '../Modal';
import {
  checkDataForSorting,
  HeaderProps,
  sortData,
  TableHeader,
  TableSortState
} from '../Table';
import {OrderActions, OrderCellWidth, OrderList} from './';
import {CancelAllOrders, ToggleOrders} from './OrderListAdditional';
import OrderListToolbar from './OrderListToolbar';

interface OrdersProps extends OrderActions {
  cancelOrder: any;
  orders: OrderModel[];
}

interface OrdersState extends TableSortState {
  isLimitEditModal: boolean;
  isStopLimitEditModal: boolean;
}

class Blotter extends React.Component<OrdersProps, OrdersState> {
  private currentEditingOrder: OrderModel;

  constructor(props: OrdersProps) {
    super(props);
    this.state = {
      data: this.props.orders,
      sortByParam: '',
      sortDirection: SortDirection.ASC,
      isLimitEditModal: false,
      isStopLimitEditModal: false
    };
  }

  componentWillReceiveProps(args: any) {
    this.setState(
      sortData(args.orders, this.state.sortByParam, this.state.sortDirection)
    );
  }

  sort = (sortByParam: string, sortDirectionDefault: string) => {
    this.setState(
      sortData(this.props.orders, sortByParam, sortDirectionDefault, this.state)
    );
    AnalyticsService.track(
      AnalyticsEvents.ApplySorting(
        place.orders,
        sortByParam,
        sortDirectionDefault
      )
    );
  };

  handleEditOrder = (order: OrderModel) => (id: string) => {
    this.currentEditingOrder = order;

    if (order.type === OrderType.Limit) {
      this.setState({
        isLimitEditModal: true
      });
    } else {
      this.setState({
        isStopLimitEditModal: true
      });
    }
  };

  handleCloseEditModal = () => {
    this.setState({
      isLimitEditModal: false,
      isStopLimitEditModal: false
    });
  };

  render() {
    const headers: HeaderProps[] = [
      {
        sortDisabled: checkDataForSorting(this.state.data, 'symbol'),
        key: 'symbol',
        value: 'Asset pair',
        width: OrderCellWidth.Symbol
      },
      {
        sortDisabled: checkDataForSorting(this.state.data, 'side'),
        className: 'left-align',
        key: 'side',
        value: 'Side',
        width: OrderCellWidth.Side
      },
      {
        sortDisabled: checkDataForSorting(this.state.data, 'price'),
        className: 'right-align',
        key: 'price',
        value: 'Price'
      },
      {
        sortDisabled: checkDataForSorting(this.state.data, 'volume'),
        className: 'right-align',
        key: 'volume',
        value: 'Amount'
      },
      {
        sortDisabled: checkDataForSorting(this.state.data, 'filled'),
        className: 'right-align',
        key: 'filled',
        value: 'Filled'
      },
      {
        sortDisabled: checkDataForSorting(this.state.data, 'value'),
        className: 'right-align',
        key: 'value',
        value: 'Value'
      },
      {
        sortDisabled: checkDataForSorting(this.state.data, 'createdAt'),
        className: 'right-align',
        key: 'createdAt',
        value: 'Time'
      },
      {
        sortDisabled: true,
        className: 'right-align',
        key: '',
        value: 'Actions',
        width: OrderCellWidth.Actions
      }
    ];

    return (
      <React.Fragment>
        <OrderListToolbar>
          <ToggleOrders />
          <CancelAllOrders />
        </OrderListToolbar>
        <HBar />
        <TableHeader
          currentSortDirection={this.state.sortDirection}
          currentSortByParam={this.state.sortByParam}
          headers={headers}
          onSort={this.sort}
        />
        <OrderList
          orders={this.state.data}
          onEditOrder={this.handleEditOrder}
          onCancelOrder={this.props.cancelOrder}
        />
        {this.state.isLimitEditModal && (
          <EditOrder
            order={this.currentEditingOrder}
            onClose={this.handleCloseEditModal}
          />
        )}
        {this.state.isStopLimitEditModal && (
          <EditOrder
            order={this.currentEditingOrder}
            onClose={this.handleCloseEditModal}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Blotter;
