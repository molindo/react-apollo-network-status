import {useReducer, useEffect} from 'react';
import Dispatcher from './Dispatcher';
import NetworkStatusAction from './NetworkStatusAction';

/**
 * Lower level hook which can be used for customizing the resulting state.
 */

export default function useApolloNetworkStatusReducer<T>(
  dispatcher: Dispatcher,
  reducer: (state: T, action: NetworkStatusAction) => T,
  initialState: T
) {
  const [status, dispatch] = useReducer(reducer, initialState);

  // Effects fire bottom-up. Therefore it's possible that when a query is nested
  // further down the tree than a component using this hook and the query fires
  // on the initial render, we'll miss the request event. Note that this isn't
  // an issue when pre-rendering or fetching on the server side.
  useEffect(() => {
    let animationFrameId: number;

    function onDispatch(action: NetworkStatusAction) {
      // Apollo fetches data while rendering and therefore invoking a GraphQL
      // request would trigger an update while another component renders. In
      // React@^16.13.1 this triggers a warning. To avoid this, we can handle
      // all network events at the beginning of the next frame.
      animationFrameId = requestAnimationFrame(() => {
        dispatch(action);
      });
    }

    dispatcher.addListener(onDispatch);
    return () => {
      dispatcher.removeListener(onDispatch);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dispatcher]);

  return status;
}
