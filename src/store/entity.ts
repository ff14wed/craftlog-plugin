import { observable, action, computed } from 'mobx';

export interface ClassJob {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Resources {
  mp: number;
  maxMP: number;
  lastTick: number;
}

export interface Status {
  id: number;
  extra: number;
  name: string;
  description: string;
  startedTime: number;
  duration: number;
  actorID: number;
  lastTick: number;
}

export interface Action {
  id: number;
  name: string;
  targetID: number;
  useTime: number;
}

export interface EntitySpec {
  id: number;
  index: number;
  name: string;
  level: number;
  classJob: ClassJob;
  resources: Resources;
  lastAction?: Action;
  statuses: Status[];
}

export default class Entity {
  id = 0;
  index = -1;
  name = "";

  @observable level = -1;
  @observable classJob: ClassJob;
  @observable resources: Resources;
  @observable lastAction?: Action;
  @observable statuses: { [idx: number]: Status } = {};

  constructor(ent: EntitySpec) {
    let {
      id, index, name, level, lastAction,
    } = ent;
    Object.assign(this, { id, index, name, level, lastAction });

    this.classJob = ent.classJob;
    this.resources = ent.resources;
    ent.statuses.forEach((s, idx) => {
      if (s) { this.statuses[idx] = s; }
    });
  }

  @action handleEntityEvent(typename: string, eventData: any) {
    switch (typename) {
      case "UpdateClass":
        this.classJob = eventData.classJob;
        break;
      case "UpdateLastAction":
        this.lastAction = eventData.action;
        break;
      case "UpsertStatus":
        this.statuses[eventData.index] = eventData.status;
        break;
      case "RemoveStatus":
        delete this.statuses[eventData.index];
        break;
      case "UpdateResources":
        this.resources = eventData.resources;
        break;
    }
  }

  @computed get lastActionName() {
    if (this.lastAction) {
      return this.lastAction.name;
    }
    return "";
  }

  // CP is the same thing as MP
  @computed get cp() {
    return this.resources.mp;
  }

  @computed get maxCP() {
    return this.resources.maxMP;
  }

  @computed get displayStatusList() {
    let l: string[] = [];
    Object.entries(this.statuses).forEach(([idx, s]) => {
      let sName = `${s.id}`;
      if (s.extra) {
        sName = `${sName} (${s.extra})`;
      }
      l.push(sName);
    });
    return JSON.stringify(l);
  }
}
