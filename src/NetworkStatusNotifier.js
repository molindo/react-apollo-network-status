import {Component} from 'react';
import PropTypes from 'prop-types';

export default class NetworkStatusNotifier extends Component {
  static propTypes = {
    initialNetworkStatus: PropTypes.object.isRequired,
    mapStateToProps: PropTypes.func.isRequired,
    render: PropTypes.func.isRequired,
    store: PropTypes.object.isRequired
  };

  state = {
    networkStatus: this.props.initialNetworkStatus
  };

  componentDidMount() {
    this.unlisten = this.props.store.listen(networkStatus => {
      this.setState({networkStatus});
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    return this.props.render(
      this.props.mapStateToProps(this.state.networkStatus)
    );
  }
}
