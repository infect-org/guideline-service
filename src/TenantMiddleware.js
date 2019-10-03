

export default class TenantMiddleware {


    constructor({
        dataSource,
    }) {
        this.dataSource = dataSource;
        this.domainConfig = new Map();
    }




    /**
     * handle incoming httop requests, set the tenant id that belongs to the domain the request came
     * from
     *
     * @param      {httpRequest}   request  The request
     */
    async handleRequest(request) {
        const authority = request.getHeader(':authority');
        const domain = authority.substr(0, authority.indexOf(':'))

        if (this.hasTenant(domain)) {
            request.setParameter('tenantId', this.resolveTenant(domain));
        } else {

            // set a default so it cannot be injected from the outside
            request.setParameter('tenantId', null);
        }
    }




    /**
     * load the configuration for the middleware
     */
    async load() {
        await this.loadDomains();
    }




    /**
     * get the domains from the tenant service
     */
    async loadDomains() {
        const domains = await this.dataSource.query(`
            {
                tenant_domain {
                    name
                    tenant {
                        id
                    }
                }
            }
        `);

        for (const domain of domains.tenant_domain) {
            this.domainConfig.set(domain.name.toLowerCase().trim(), domain.tenant.id);
        }

        this.timeout = setTimeout(() => {
            this.loadDomains().catch(console.log)
        }, 5000);
    }





    /**
     * Determines if a domain is configured for a tenant
     *
     * @param      {string}   domain  The domain
     */
    hasTenant(domain) {
        return this.domainConfig.has(domain.toLowerCase().trim());
    }




    /**
     * returns the tenant id for a given domain
     *
     * @param      {string}  domain  The domain
     */
    resolveTenant(domain) {
        return this.domainConfig.get(domain.toLowerCase().trim());
    }




    /**
     * end the middleware, stop polling the config
     */
    end() {
        clearTimeout(this.timeout);
    }
}