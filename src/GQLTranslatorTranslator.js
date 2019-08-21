


export default class GQLTranslatorTranslator {


    constructor({
        models,
        dataSource,
    }) {
        this.dataSource = dataSource;
        this.models = models;
    }



    registerRoutes(router) {
        for (const [serviceName, models] of Object.entries(this.models)) {
            for (const [modelName, config] of Object.entries(models)) {
                const resourceName = `${serviceName}_${modelName}`;
                const query = `{
                    ${resourceName} {
                        ${config.properties.join('\n')}
                    }
                }`;

                router.get(`/v1/${modelName}`, async(request) => {
                    let data = await this.dataSource.query(query);
                    data = data[resourceName];

                    data.forEach((item) => {
                        delete item.__typename;
                    });

                    request.response().status(200).send(JSON.stringify(data))
                });
            }
        }
    }
}