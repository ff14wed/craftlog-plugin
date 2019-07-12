import React, { Component } from 'react';

import { MenuItem, Classes } from '@blueprintjs/core';

import { observer } from 'mobx-react';

import InlineDiv from './InlineDiv';
import Craft from '../store/craft';

const smallClasses = `${Classes.TEXT_SMALL} ${Classes.TEXT_MUTED}`;

interface CraftListItemProps {
  craft: Craft;
  selected: boolean;

  onSelect: (id: string) => void;
}

@observer
export default class CraftListItem extends Component<CraftListItemProps> {
  onClick = () => {
    this.props.onSelect(this.props.craft.id);
  }

  render() {
    const { craft, selected } = this.props;

    let child = (
      <div>
        <InlineDiv>{craft.recipe.name} </InlineDiv>
        <InlineDiv className={smallClasses}>({craft.numSteps} steps) - {craft.timestamp}</InlineDiv>
        {(!craft.failed && craft.completed) && <InlineDiv className={smallClasses}> COMPLETED</InlineDiv>}
        {craft.failed && <InlineDiv className={smallClasses}> FAILED</InlineDiv>}
      </div>
    );

    return (
      <MenuItem text={child} active={selected} onClick={this.onClick} />
    );
  }
}
