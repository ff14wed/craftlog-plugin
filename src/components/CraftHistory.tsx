import React, { Component } from 'react';

import { Elevation, NonIdealState, HTMLTable } from '@blueprintjs/core';
import styled from 'styled-components';

import PaddedCard from './PaddedCard';
import TwoColumnTable from './TwoColumnTable';

import { inject, observer } from 'mobx-react';
import { StreamStoreProps, streamStoreDefaultProps } from '../store/stream';
import { DisplayCraftInfo } from '../store/craft';


const NonIdealBox = styled.div`
  height: 400px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Content = styled.div`
  flex: 1 0 auto;
`;

@inject("streamStore")
@observer
export default class CraftHistory extends Component<StreamStoreProps> {
  static defaultProps = streamStoreDefaultProps;

  render() {
    const { selectedCraft } = this.props.streamStore;
    if (!selectedCraft) {
      return (
        <PaddedCard elevation={Elevation.THREE}>
          <NonIdealBox>
            <NonIdealState
              icon="list"
              title="No craft history selected"
              description="Select a craft history to view it."
            />
          </NonIdealBox>
        </PaddedCard>
      );
    }

    return (
      <PaddedCard elevation={Elevation.THREE}>
        <Container>
          <Content>
            <TwoColumnTable infos={selectedCraft.info} />
          </Content>
          <Content>
            <HTMLTable condensed interactive striped>
              <thead>
                <tr>
                  <th>Step Num</th>
                  <th>Durability</th>
                  <th>Progress</th>
                  <th>Quality</th>
                  <th>HQ Chance</th>
                  <th>Condition</th>
                  <th>Next Condition</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedCraft.history.map((c: DisplayCraftInfo) =>
                  <tr key={c.id}>
                    <th>{c.StepNum - 1}</th>
                    <th>{c.Durability}</th>
                    <th>{c.Progress}</th>
                    <th>{c.Quality}</th>
                    <th>{c.HQChance}</th>
                    <th>{c.PreviousCondition}</th>
                    <th>{c.CurrentCondition}</th>
                    <th>{c.LastCraftAction} </th>
                  </tr>
                )}
              </tbody>
            </HTMLTable>
          </Content>
        </Container>
      </PaddedCard>
    );
  }
}
