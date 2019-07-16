import gql from 'graphql-tag';

export default new class {
  classJobFragment = gql`
    fragment classJob on ClassJob {
      id
      name
      abbreviation
    }
  `;

  resourcesFragment = gql`
    fragment resources on Resources {
      mp
      maxMP
      lastTick
    }
  `;

  actionFragment = gql`
    fragment action on Action {
      id
      name
      targetID
      useTime
    }
  `;

  statusFragment = gql`
    fragment status on Status {
      id
      param
      name
      description
      startedTime
      duration
      actorID
      lastTick
    }
  `;

  entityFragment = gql`
    fragment entity on Entity {
      id
      index
      name
      level
      classJob {
        ...classJob
      }
      resources {
        ...resources
      }
      lastAction {
        ...action
      }
      statuses {
        ...status
      }
    }
    ${this.classJobFragment}
    ${this.resourcesFragment}
    ${this.actionFragment}
    ${this.statusFragment}
  `;

  craftingInfoFragment = gql`
    fragment craftingInfo on CraftingInfo {
      recipe {
        id
        name
        recipeLevel
        element
        canHQ
        difficulty
        quality
        durability
      }

      lastCraftActionID
      lastCraftActionName
      stepNum

      progress
      progressDelta

      quality
      qualityDelta

      hqChance

      durability
      durabilityDelta

      currentCondition
      previousCondition

      reuseProc
    }
  `;

  streamFragment = gql`
    fragment stream on Stream {
      id
      characterID
      craftingInfo {
        ...craftingInfo
      }

      entities {
        ...entity
      }
    }
    ${this.entityFragment}
    ${this.craftingInfoFragment}
  `;

  streamSubscription = gql`
    subscription Streams {
      streamEvent {
        streamID
        type {
          __typename
          ... on UpdateIDs {
            characterID
          }
          ... on UpdateCraftingInfo {
            craftingInfo {
              ...craftingInfo
            }
          }
        }
      }
    }
    ${this.craftingInfoFragment}
  `;

  entitySubscription = gql`
    subscription Entities {
      entityEvent {
        streamID
        entityID
        type {
          __typename
          ... on AddEntity {
            entity {
              ...entity
            }
          }
          ... on RemoveEntity {
            id
          }
          ... on SetEntities {
            entities {
              ...entity
            }
          }
          ... on UpdateClass {
            classJob {
              ...classJob
            }
          }
          ... on UpdateLastAction {
            action {
              ...action
            }
          }
          ... on UpsertStatus {
            index
            status {
              ...status
            }
          }
          ... on RemoveStatus {
            index
          }
          ... on UpdateResources {
            resources {
              ...resources
            }
          }
        }
      }
    }
    ${this.entityFragment}
    ${this.classJobFragment}
    ${this.actionFragment}
    ${this.statusFragment}
    ${this.resourcesFragment}
  `;

  versionQuery = gql`
    query Version {
      apiVersion
    }
  `;

  streamQuery = gql`
    query GetStream($streamID: Int!) {
      stream(streamID: $streamID) {
        ...stream
      }
    }
    ${this.streamFragment}
  `;

  listStreamsQuery = gql`
    query AllStreams {
      streams {
        id
      }
    }
  `;

  hookMutation = gql`
    mutation SendHookData($req: StreamRequest!) {
      sendStreamRequest(request: $req)
    }
  `;
}()
