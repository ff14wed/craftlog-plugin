import React, { Component } from 'react';

import { UL, Elevation, Colors, H5, Button } from '@blueprintjs/core';
import styled from 'styled-components';

import PaddedCard from './PaddedCard';
import CraftListItem from './CraftListItem';

import { inject, observer } from 'mobx-react';
import { streamStoreDefaultProps, StreamStoreProps } from '../store/stream';

const List = styled(UL)`
  list-style: none;
  padding: 0;
  max-height: 30vh;
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

@inject("streamStore")
@observer
export default class CraftListContainer extends Component<StreamStoreProps> {
  static defaultProps = streamStoreDefaultProps;

  downloadHistory = () => {
    this.props.streamStore.downloadHistory();
  }

  render() {
    return (
      <PaddedCard elevation={Elevation.THREE}>
        <H5>Craft Histories</H5>
        <Button onClick={this.downloadHistory}>Download History</Button>
        <CraftList />
      </PaddedCard>
    );
  }
}

@inject("streamStore")
@observer
class CraftList extends Component<StreamStoreProps> {
  static defaultProps = streamStoreDefaultProps;

  onSelect = (id: string) => {
    this.props.streamStore.setSelectedCraftID(id);
  }

  render() {
    const { craftHistory, selectedCraft } = this.props.streamStore;
    return (
      <List>
        {Array.from(craftHistory).reverse().map(([_, c]) =>
          <CraftListItem
            key={c.id} craft={c}
            selected={c === selectedCraft}
            onSelect={this.onSelect}
          />
        )}
      </List>
    );
  }
}
