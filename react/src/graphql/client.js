import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';

import { goLogin } from '../redux/router/actions.js';

const getCookies = () => {
  const cookies = document.cookie.split(';').reduce((obj, cookie) => {
    const [key, value] = cookie.split('=');
    obj[key.trim()] = value;
    return obj;
  }, {});
  return cookies;
};

const customFetch = (request, init) => {
  return fetch(request, {
    ...init,
    headers: {
      ...init.headers,
      'CSRF-Token': getCookies()['_bcsrf'] || null,
    },
  });
};

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) => {
      if (message === 'not authorized') {
        goLogin();
      }
    });
  }
});

const httpLink = new HttpLink({
  uri: '/graphql',
  credentials: 'include',
  fetch: customFetch,
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id || null,
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

export default client;
