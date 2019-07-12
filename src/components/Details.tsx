import React, { Component } from 'react';
import { Colors, Elevation, NonIdealState } from '@blueprintjs/core';
import styled from 'styled-components';

import { inject, observer } from 'mobx-react';

import PaddedCard from './PaddedCard';
import ResourceValue from './ResourceValue';
import TwoColumnTable from './TwoColumnTable';
import { streamStoreDefaultProps, StreamStoreProps } from '../store/stream';

const NonIdealBox = styled.div`
  height: 340px;
`;

@inject("streamStore")
@observer
export default class Details extends Component<StreamStoreProps> {
  static defaultProps = streamStoreDefaultProps;
  render() {
    const { characterEntity, currentCraft } = this.props.streamStore;

    const noCraftMessage = (
      <NonIdealBox>
        <NonIdealState
          icon="build"
          title="No crafting in progress"
          description="Start a craft to see current details on the crafting state."
        />
      </NonIdealBox>
    );

    if (!characterEntity) {
      return (
        <PaddedCard elevation={Elevation.THREE}>
          <NonIdealBox>
            <NonIdealState
              icon="user"
              title="No character detected"
              description="Please rezone or log in to see the state of your current character."
            />
          </NonIdealBox>
        </PaddedCard>
      );
    }

    const { level, cp, maxCP, lastActionName, displayStatusList } = characterEntity;
    const infos = {
      Level: level,
      CP: (<ResourceValue current={cp} max={maxCP} color={Colors.GOLD3} />),
      LastAction: lastActionName,
      Statuses: displayStatusList,
      CurrentCraft: (currentCraft && currentCraft.info) || noCraftMessage,
    };
    return (
      <PaddedCard elevation={Elevation.THREE}>
        <TwoColumnTable infos={infos} />
      </PaddedCard>
    );
  }
}
