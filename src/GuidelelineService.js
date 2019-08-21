import RainbowConfig from '@rainbow-industries/rainbow-config';
import path from 'path';
import DataSource from './DataSource.js';
import Server from './Server.js';
import GQLTranslatorTranslator from './GQLTranslatorTranslator.js';


export default class GuidelelineService {


    constructor() {

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

        this.requestTranslator.registerRoutes(this.server.getRouter());
    }




    async setupServer() {
        this.server = new Server({
            port: this.config.get('server.port'),
        });
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

