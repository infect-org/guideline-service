

export default class HiddenFilter {


    static name = '_hiddenFilter'


    /**
     * process the filter
     *
     * @param      {GraphQLQuery}  query    the graphql query object
     * @param      {object|array}  config   the uery configuration
     * @param      {HTTp"Request}  request  the http2 request object
     */
    process(query, config, request) {
            
        if (!(request.hasQueryParameter('showAllData') && 
            request.getQueryParameter('showAllData') === 'true')) {
            query.applyFilter(config);
        }
    }
}