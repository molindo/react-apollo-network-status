import NetworkStatusAction from './NetworkStatusAction';

type Listener = (action: NetworkStatusAction) => void;

export default class Dispatcher {
  listeners: Listener[] = [];

  addListener(fn: Listener) {
    this.listeners.push(fn);
  }

  removeListener(fn: Listener) {
    this.listeners = this.listeners.filter(cur => cur !== fn);
  }

  dispatch(action: NetworkStatusAction) {
    this.listeners.forEach(currentListener => {
      currentListener(action);
    });
  }
}
