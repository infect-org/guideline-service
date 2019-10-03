

export default class LmitFilter {


    static name = '_order_by'


    /**
     * process the order
     *
     * @param      {GraphQLQuery}  query    the graphql query object
     * @param      {object|array}  config   the uery configuration
     * @param      {HTTp"Request}  request  the http2 request object
     */
    process(query, config, request) {
        query.applyOrder(config);
    }
}