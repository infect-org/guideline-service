import ForEachProcessor from './graphQLProcessor/ForEachProcessor.js';
import GraphQLQuery from './GraphQLQuery.js';
import HiddenFilterProcessor from './graphQLProcessor/HiddenFilterProcessor.js';
import LimitProcessor from './graphQLProcessor/LimitProcessor.js';
import OrderProcessor from './graphQLProcessor/OrderProcessor.js';
import PropertiesProcessor from './graphQLProcessor/PropertiesProcessor.js';
import TenantFilterProcessor from './graphQLProcessor/TenantFilterProcessor.js';
import VMModule from './VMModule.js';



export default class GQLTranslatorTranslator {


    constructor({
        models,
        dataSource,
    }) {
        this.dataSource = dataSource;
        this.models = models;

        this.processors = new Map();
        this.processors.set(ForEachProcessor.name, new ForEachProcessor());
        this.processors.set(HiddenFilterProcessor.name, new HiddenFilterProcessor());
        this.processors.set(LimitProcessor.name, new LimitProcessor());
        this.processors.set(OrderProcessor.name, new OrderProcessor());
        this.processors.set(PropertiesProcessor.name, new PropertiesProcessor());
        this.processors.set(TenantFilterProcessor.name, new TenantFilterProcessor());
    }



    registerRoutes(router) {
        for (const [serviceName, models] of Object.entries(this.models)) {
            for (const [modelName, config] of Object.entries(models)) {
                const resourceName = `${serviceName}_${modelName}`;

                router.get(`/${serviceName}/v1/${modelName}`, async(request) => {
                    const query = await this.buildGraphQLQuery(resourceName, config, request, true);

                    let data = await this.dataSource.query(query.toString());

                    // remove containing object
                    data = data[resourceName];

                    // remove metadata
                    this.cleanUpData(data);

                    // post processing
                    data = await this.postProcessData(config, data);

                    // send to the client
                    request
                        .response()
                        .status(200)
                        .setHeader('content-type', 'application/json')
                        .send(JSON.stringify(data));
                });
            }
        }
    }



    /**
     * remove metadata form the payload
     *
     * @param      {*}  data    The data
     */
    cleanUpData(data) {
        if (Array.isArray(data)) {
            for (const item of data) {
                this.cleanUpData(item);
            }
        } else if (typeof data === 'object' && data !== null) {
            if (data.__typename) {
                delete data.__typename;
            }

            for (const value of Object.values(data)) {
                this.cleanUpData(value);
            }
        }
    }



    /**
     * post process data
     *
     * @param      {object}   config  The configuration
     * @param      {array}    data    The data
     */
    async postProcessData(config, data) {
        for (let [key, value] of Object.entries(config)) {
             
            // this needs to be processed by a separate class
            if (key.startsWith('_')) {
                if (!this.processors.has(key)) {
                    throw new Error(`Missing processor for the key '${key}'!`);
                }

                const processor = this.processors.get(key);
                if (processor.isPostProcessor) {


                    // compile source
                    if (typeof value === 'string') {
                        value = new VMModule({
                            sourceCode: value,
                        });

                        await value.load();

                        config[key] = value;
                    }

                    data = await processor.process(data, value);
                }
            }
        }

        return data;
    }







    async buildGraphQLQuery(name, config, request, isRootQuery = false) {
        const query = new GraphQLQuery({
            name,
            isRootQuery,
        });


        for (const [key, value] of Object.entries(config)) {
             
            // this needs to be processed by a separate class
            if (key.startsWith('_')) {
                if (!this.processors.has(key)) {
                    throw new Error(`Missing processor for the key '${key}'!`);
                }

                const processor = this.processors.get(key);
                if (!processor.isPostProcessor) {
                    processor.process(query, value, request);
                }
            } else {
                const subQuery = await this.buildGraphQLQuery(key, value, request);
                query.addChild(subQuery);
            }
        }


        return query;
    }
}