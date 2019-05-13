import {useContext, useReducer, useLayoutEffect} from 'react';
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

  // Theoretically we should `useEffect` here. However react-apollo@<=2.5.5 uses
  // React classes and queries can begin to fire in `componentDidMount`.
  // Therefore we'd miss the request event of an operation. Once `react-apollo`
  // has migrated, we could bump the peer dependency and use the correct hook
  // here for a slight performance improvement.
  useLayoutEffect(() => {
    dispatcher.addListener(dispatch);
    return () => dispatcher.removeListener(dispatch);
  }, [dispatcher, reducer, status]);

  return status;
}
