import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { inject, observer, Provider } from 'mobx-react';

import streamStore, { PluginParams, StreamStoreProps, streamStoreDefaultProps } from './store/stream';

import App from './components/App';
import LoadingApp from './components/LoadingApp';

declare global {
  interface Window {
    waitForInit?: boolean;
    initPlugin?: (params: PluginParams) => void;
  }
}

const getPluginParams = async (): Promise<PluginParams> => {
  if (!window.waitForInit) {
    return {
      apiURL: 'http://localhost:8080/query',
    };
  } else {
    return new Promise((resolve) => {
      window.initPlugin = (params) => {
        resolve(params);
      };
    });
  }
};

@inject('streamStore')
@observer
class Main extends Component<StreamStoreProps> {
  static defaultProps = streamStoreDefaultProps;

  componentDidMount() {
    getPluginParams().then((params) => {
      this.props.streamStore.initialize(params);
    });
  }

  render() {
    const { loading, error } = this.props.streamStore;

    if (loading) return <LoadingApp error={error} />;
    return (<App />);
  }
}


const MainWithState = () => (
  <Provider {...{ streamStore }}>
    <Main />
  </Provider>
);

ReactDOM.render(<MainWithState />, document.getElementById('root'));
