

export default class TenantFilter {

    // name as seen in the config file
    static name = '_properties'


    /**
     * process the properties
     *
     * @param      {GraphQLQuery}  query    the graphql query object
     * @param      {object|array}  config   the uery configuration
     * @param      {HTTp"Request}  request  the http2 request object
     */
    process(query, config, request) {
        query.addProperty(...config);
    }
}