import gql from './gql';

import { ApolloLink, ApolloClient, InMemoryCache, HttpLink, from, split, type NormalizedCacheObject } from "@apollo/client/core/index.js";
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from "@apollo/client/link/error";

const errHandlerLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authLink = (apiToken?: string): ApolloLink => {
  return new ApolloLink((operation, forward) => {
    if (apiToken) {
      operation.setContext(({ headers }: { headers: any }) => ({
        headers: {
          Authorization: apiToken,
          ...headers
        }
      }));
    }
    return forward(operation);
  });
};

export default class GQLClient {
  private client: ApolloClient<NormalizedCacheObject>;

  constructor(apiURL: string, apiToken?: string) {
    let wsConnectionParams = (apiToken) ? () => ({
      authorization: apiToken,
    }) : undefined;

    const httpLink = from([errHandlerLink, authLink(apiToken), new HttpLink({
      uri: apiURL,
    })]);

    const wsLink = from([errHandlerLink, new GraphQLWsLink(createClient({
      url: apiURL.replace('http://', 'ws://'),
      retryAttempts: 10,
      connectionParams: wsConnectionParams
    }
    ))]);

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );

    this.client = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
        },
      }
    });
  }

  public getAPIVersion = async (): Promise<string> => {
    const result = await this.client.query({ query: gql.versionQuery });
    if (result.error || result.errors) {
      console.error("Encountered error getting API Version");
    }
    return result.data.apiVersion;
  }

  public listStreams = async () => {
    const result = await this.client.query({ query: gql.listStreamsQuery });
    if (result.error || result.errors) {
      console.error("Encountered error getting streams");
    }
    return result.data.streams;
  };

  public getStream = async (streamID: number) => {
    const variables = { streamID };

    const result = await this.client.query({ query: gql.streamQuery, variables });
    if (result.error || result.errors) {
      console.error("Encountered error getting stream");
    }

    return result.data.stream;
  }

  public subscribeToStreamEvents = (
    streamID: number, handleStreamEvent: (type: string, data: any) => void
  ) => {
    this.client.subscribe({ query: gql.streamSubscription }).subscribe({
      next: this.createStreamEventCB(streamID, handleStreamEvent),
      error: (err) => console.log("Stream subscription err:", err),
    });
  }

  createStreamEventCB = (streamID: number, cb: (type: string, data: any) => void) => {
    return (subscriptionData: any) => {
      if (!subscriptionData.data) { return; }
      let streamEvent = subscriptionData.data.streamEvent;
      if (streamEvent.streamID !== streamID) { return; }
      let { __typename, ...eventData } = streamEvent.type;
      cb(__typename, eventData);
    }
  }

  public subscribeToEntityEvents = (
    streamID: number, handleEntityEvent: (entityID: number, type: string, data: any) => void,
  ) => {
    this.client.subscribe({ query: gql.entitySubscription }).subscribe({
      next: this.createEntityEventCB(streamID, handleEntityEvent),
      error: (err) => console.log("Entity subscription err:", err),
    });
  }

  createEntityEventCB = (streamID: number, cb: (entityID: number, type: string, data: any) => void) => {
    return (subscriptionData: any) => {
      if (!subscriptionData.data) { return; }
      let entityEvent = subscriptionData.data.entityEvent;
      if (entityEvent.streamID !== streamID) { return; }

      let { entityID } = entityEvent;
      let { __typename, ...eventData } = entityEvent.type;
      cb(entityID, __typename, eventData);
    }
  }
}
