import greenlet from 'greenlet';
import {Provider} from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './Logger';
import {RootStore} from './stores/index';

const rootStore = new RootStore(true, greenlet);

const render = (AppComponent: any) => {
  ReactDOM.render(
    <Provider {...rootStore}>
      <AppComponent />
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
};

render(App);
