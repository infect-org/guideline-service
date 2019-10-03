import DataSource from './DataSource.js';
import GQLTranslatorTranslator from './GQLTranslatorTranslator.js';
import path from 'path';
import RainbowConfig from '@rainbow-industries/rainbow-config';
import Server from './Server.js';
import TenantMiddleware from './TenantMiddleware.js';
import TenantConfigurationController from './controller/TenantConfiguration.js';


export default class GuidelelineService {


    constructor() {
        this.controllers = new Set();
    }




    async load() {
        await this.loadConfig();
        await this.loadDataSource();
        await this.setupServer();
        await this.setupRoutes();
    }



    async setupRoutes() {
        this.requestTranslator = new GQLTranslatorTranslator({
            models: this.config.get('models'),
            dataSource: this.dataSource,
        });

        const router = this.server.getRouter();

        this.setupControllers(router);
        this.requestTranslator.registerRoutes(router);
    }




    setupControllers(router) {
        this.controllers.add(new TenantConfigurationController({
            dataSource: this.dataSource,
        }));

        for (const controller of this.controllers.values()) {
            controller.registerRoutes(router);
        }
    }



    async setupServer() {
        this.server = new Server({
            port: this.config.get('server.port'),
        });

        this.tenantMiddleware = new TenantMiddleware({
            dataSource: this.dataSource,
        });

        this.server.registerMiddleware(this.tenantMiddleware);

        await this.tenantMiddleware.load();
        await this.server.listen();
    }




    async loadDataSource() {
        this.dataSource = new DataSource({
            host: this.config.get('data-source.host'),
            secret: this.config.get('data-source.secret'),
        });
    }



    async loadConfig() {
        const secretsDir = path.join(path.dirname(new URL(import.meta.url).pathname), '../');
        const configDir = path.join(secretsDir, './config');
        this.config = new RainbowConfig(configDir, secretsDir);
        await this.config.load();
    }
}

