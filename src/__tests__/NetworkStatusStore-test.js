import NetworkStatusStore from '../NetworkStatusStore';

it('delegates state updates to reducers', () => {
  const store = new NetworkStatusStore({
    initialState: {loading: false},
    reducers: {
      onRequest: () => ({loading: true}),
      onSuccess: () => ({loading: false}),
      onError: () => ({loading: false})
    }
  });

  const states = [];
  store.listen(state => {
    states.push(state);
  });

  store.onRequest();
  store.onSuccess();
  store.onRequest();
  store.onError();

  expect(states).toEqual([
    {loading: true},
    {loading: false},
    {loading: true},
    {loading: false}
  ]);
});

it("doesn't emit when a reducer returns the same state", () => {
  const store = new NetworkStatusStore({
    initialState: {loading: false},
    reducers: {
      onRequest: state => state,
      onSuccess: state => state,
      onError: state => state
    }
  });

  const states = [];
  store.listen(state => {
    states.push(state);
  });

  store.onRequest();
  store.onSuccess();
  store.onRequest();
  store.onError();

  expect(states).toEqual([]);
});
