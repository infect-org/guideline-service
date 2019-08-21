import apolloClient from 'apollo-client';
import inMemoryCache from 'apollo-cache-inmemory';
import httpLink from 'apollo-link-http';
import fetch from 'node-fetch';
import apolloBoost from 'apollo-boost';

const { ApolloClient } = apolloClient;
const { InMemoryCache } = inMemoryCache;
const { HttpLink } = httpLink;
const { gql } = apolloBoost;

export default class DataSource {


    constructor({
        host,
        secret,
    }) {
        this.host = host;

        this.cache = new InMemoryCache();
        this.link = new HttpLink({
            uri: this.host,
            fetch,
            headers: {
                'x-hasura-admin-secret': secret,
            }
        });

        this.client = new ApolloClient({
            cache: this.cache,
            link: this.link,
        });
    }



    async query(query) {
        const data = await this.client.query({
            query: gql`${query}`
        });
        
        return data.data;
    }
}