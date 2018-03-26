import {createChangeEmitter} from 'change-emitter';

export default class NetworkStatusStore {
  emitter;
  reducers;
  state;

  constructor({initialState, reducers}) {
    this.state = initialState;
    this.reducers = reducers;

    this.emitter = createChangeEmitter();
  }

  onRequest = action => {
    this.updateState(this.reducers.onRequest(this.state, action));
  };

  onSuccess = action => {
    this.updateState(this.reducers.onSuccess(this.state, action));
  };

  onError = action => {
    this.updateState(this.reducers.onError(this.state, action));
  };

  onCancel = action => {
    if (this.reducers.onCancel) {
      this.updateState(this.reducers.onCancel(this.state, action));
    }
  };

  updateState(next) {
    if (next === this.state) return;

    this.state = next;
    this.emit();
  }

  emit() {
    this.emitter.emit(this.state);
  }

  listen(fn) {
    return this.emitter.listen(fn);
  }
}
