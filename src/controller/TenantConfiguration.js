

export default class TenantConfigurationController {


    constructor({
        dataSource,
    }) {
        this.dataSource = dataSource;
    }




    async handleRequest(request) {
        if (!request.hasParameter('tenantId') || request.getParameter('tenantId') === 'null') {
            throw new Error(`Missing the tenant id on the request!`);
        }

        const tenantData = await this.dataSource.query(`
            {
                tenant_tenant(where: {id: {_eq: ${request.getParameter('tenantId')}}}) {
                    tenant_configurations {
                        data
                        configuration {
                            identifier
                        }
                    }
                    tenant_featureFlags {
                        enabled
                        featureFlag {
                            identifier
                        }
                    }
                    name
                    identifier
                }
            }
        `);
        const data = tenantData.tenant_tenant[0];

        const config = {
            name: data.name,
            identifier: data.identifier,
            configuration: data.tenant_configurations.map((item) => {

                if (item.configuration.identifier === 'frontend') {
                    item.data.userInterface.logoUrl = `/tenant/${data.identifier}/logo.svg`;
                    item.data.userInterface.aboutDocumentUrl = `/tenant/${data.identifier}/about/overlay.md`;
                }

                return {
                    config: item.data,
                    identifier: item.configuration.identifier,
                };
            }),
            featureFlags: data.tenant_featureFlags.map((flags) => {
                return {
                    enabled: flags.enabled,
                    identifier: flags.featureFlag.identifier,
                };
            }),
        };

        request.response().status(200).send(config);
    }







    registerRoutes(router) {
        router.get('/tenant/v1/config', async (request) => {
            return this.handleRequest(request);
        });
    }
}