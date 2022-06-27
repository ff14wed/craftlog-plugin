import * as React from 'react';
import { Colors } from '@blueprintjs/core';

import styled from 'styled-components';

import './App.css';

import Details from './Details';
import CraftList from './CraftList';
import CraftHistory from './CraftHistory';

const AppRoot = styled.div`
  background-color: ${Colors.DARK_GRAY1};
  height: 100vh;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: ${Colors.GRAY1};
  }

  &::-webkit-scrollbar-thumb {
    background: ${Colors.DARK_GRAY5};
  }
`;

export default class App extends React.Component {
  render() {
    return (
      <AppRoot className="bp4-dark">
        <Details />
        <CraftList />
        <CraftHistory />
      </AppRoot>
    );
  }
}
