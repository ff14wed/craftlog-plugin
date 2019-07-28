import React, { Component } from 'react';

import { MenuItem, Classes } from '@blueprintjs/core';

import { observer } from 'mobx-react';

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
        <span>{craft.recipe.name} </span>
        <span className={smallClasses}>({craft.numSteps} steps) - {craft.timestamp}</span>
        {(!craft.failed && craft.completed) && <span className={smallClasses}> COMPLETED</span>}
        {craft.failed && <span className={smallClasses}> FAILED</span>}
      </div>
    );

    return (
      <MenuItem text={child} active={selected} onClick={this.onClick} />
    );
  }
}
