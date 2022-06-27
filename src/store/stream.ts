import { action, observable, computed } from 'mobx';
import GQLClient from '../api/gqlClient';

import Entity, { EntitySpec } from './entity';
import Craft from './craft';

import semver from 'semver';

export interface StreamStoreProps {
  streamStore: Stream;
}
export const streamStoreDefaultProps = { streamStore: (null as unknown) as Stream };

export interface PluginParams {
  apiURL: string;
  apiToken?: string;
  streamID?: number;
}

class Stream {
  @observable loading = true;
  @observable error?: string;

  gqlClient?: GQLClient;
  streamID = 0;
  apiURL = '';;

  @observable craftHistory = new Map<string, Craft>();
  @observable selectedCraftID = "";
  @observable currentCraftID = "";
  @observable entities = new Map<number, Entity>();
  @observable characterID = 0;

  @action async initialize(pluginParams: PluginParams) {
    this.gqlClient = new GQLClient(pluginParams.apiURL, pluginParams.apiToken);

    const apiVersion = await this.gqlClient.getAPIVersion();

    if (!semver.satisfies(apiVersion, '>=0.3.1', { includePrerelease: true })) {
      this.error = "Your version of Aetherometer is no longer supported by " +
        "this plugin. Please update to a newer version.";
      return;
    }


    const streamID = this.streamID = await this.getActiveStreamID(pluginParams);
    this.subscribeToStreamEvents();
    this.subscribeToEntityEvents();

    if (!streamID) {
      this.error = "Stream ID not found!";
      return;
    }

    const stream = await this.gqlClient.getStream(streamID);

    const { entities, characterID } = stream;
    this.characterID = characterID;
    for (let ent of entities) {
      this.entities.set(ent.id, new Entity(ent));
    }

    this.loading = false;
  }

  async getActiveStreamID(pluginParams: PluginParams) {
    if (pluginParams.streamID) {
      return pluginParams.streamID;
    } else {
      const streams = await this.gqlClient!.listStreams();
      if (streams.length > 0) {
        return streams[0].id;
      }
    }
    return 0;
  }

  @action subscribeToStreamEvents() {
    return this.gqlClient!.subscribeToStreamEvents(
      this.streamID,
      action((typename: string, eventData: any) => {
        if (this.loading) { return; }
        switch (typename) {
          case "UpdateIDs":
            this.characterID = eventData.characterID;
            break;
          case "UpdateCraftingInfo":
            if (!eventData.craftingInfo) {
              this.currentCraftID = "";
            } else if (this.currentCraft) {
              this.currentCraft.craftingEvent(eventData.craftingInfo);
            } else {
              let newCraft = new Craft(eventData.craftingInfo);
              this.craftHistory.set(newCraft.id, newCraft);
              this.currentCraftID = newCraft.id;
            }
            let e = this.characterEntity;
            if (this.currentCraft && e) {
              this.currentCraft.updateCP(e.cp, e.maxCP);
            }
            break;
        }
      }));
  }

  @action subscribeToEntityEvents() {
    return this.gqlClient!.subscribeToEntityEvents(
      this.streamID,
      action((entityID: number, typename: string, eventData: any) => {
        if (this.loading) { return; }

        if (typename === "AddEntity") {
          this.addEntity(eventData.entity);
          return;
        } else if (typename === "RemoveEntity") {
          this.removeEntity(eventData.id);
          return;
        } else if (typename === "SetEntities") {
          this.setEntities(eventData.entities);
          return;
        }
        if (this.characterEntity && entityID === this.characterEntity.id) {
          this.characterEntity.handleEntityEvent(typename, eventData);
        }
      }));
  }

  @action addEntity(ent: EntitySpec) {
    this.entities.set(ent.id, new Entity(ent));
  }

  @action removeEntity(id: number) {
    this.entities.delete(id);
  }

  @action setEntities(entities: EntitySpec[]) {
    this.entities.clear();
    entities.forEach((ent) => {
      this.addEntity(ent);
    });
  }

  @action setSelectedCraftID(id: string) {
    this.selectedCraftID = id;
  }

  @computed get characterEntity() {
    return this.entities.get(this.characterID);
  }

  @computed get selectedCraft() {
    if (this.craftHistory.has(this.selectedCraftID)) {
      return this.craftHistory.get(this.selectedCraftID);
    } else {
      return null;
    }
  }

  @computed get currentCraft() {
    return this.craftHistory.get(this.currentCraftID);
  }

  async downloadHistory() {
    let blob = JSON.stringify(this.craftHistory, null, 4);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const a = document.createElement('a');
    a.style.display = "none";
    a.href = url;
    a.download = `craftlog-${(new Date()).toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}

export default new Stream();
