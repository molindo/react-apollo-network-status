import {useContext, useReducer, useEffect} from 'react';
import ApolloNetworkStatusDispatcherContext from './ApolloNetworkStatusDispatcherContext';
import Dispatcher from './Dispatcher';
import {NetworkStatusAction} from './NetworkStatusAction';

/**
 * Lower level hook which can be used for customizing the resulting state.
 */

export default function useApolloNetworkStatusReducer<T>(
  reducer: (state: T, action: NetworkStatusAction) => T,
  initialState: T
) {
  const [status, dispatch] = useReducer(reducer, initialState);
  const dispatcher = useContext<Dispatcher | undefined>(
    ApolloNetworkStatusDispatcherContext
  );

  if (!dispatcher) {
    throw new Error(
      '`useApolloNetworkStatus` needs to be wrapped with `ApolloNetworkStatusProvider`.'
    );
  }

  // Effects fire bottom-up. Therefore it's possible that when a query is nested
  // further down the tree than a component using this hook and the query fires
  // on the initial render, we'll miss the request event. Note that this isn't
  // an issue when pre-rendering or -fetching on the server side.
  useEffect(() => {
    dispatcher.addListener(dispatch);
    return () => dispatcher.removeListener(dispatch);
  }, [dispatcher]);

  return status;
}
