

export default class TenantFilter {

    // name as seen in the config file
    static name = '_tenantFilter'


    /**
     * process the filter
     *
     * @param      {GraphQLQuery}  query    the graphql query object
     * @param      {object|array}  config   the uery configuration
     * @param      {HTTp"Request}  request  the http2 request object
     */
    process(query, config, request) {
        if (!request.hasParameter('tenantId') || request.getParameter('tenantId') === null) {
            throw new Error(`Failed to resolve the tenant for the domain ${request.getHeader(':authority')}: please configure the domain in the backoffice!`);
        }

        // copy the filter object
        const filter = JSON.parse(JSON.stringify(config));

        // replace the placeholder
        this.replaceTanantValue(filter, request.getParameter('tenantId'));

        query.applyFilter(filter);
    }



    /**
     * replace the placeholder value in the tenant filter wit the tenant id
     *
     * @param      {object}  input     filter object
     * @param      {number}  tenantId  The tenant identifier
     */
    replaceTanantValue(input, tenantId) {
        for (const [key, value] of Object.entries(input)) {
            if (key === '_eq' && value === '$(tenantId)') {
                input[key] = tenantId;
            } else if (typeof value === 'object') {
                this.replaceTanantValue(value, tenantId);
            }
        }
    }
}