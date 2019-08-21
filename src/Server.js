import HTTP2Server from '@distributed-systems/http2-server';



export default class Server {


    constructor({
        port,
    }) {
        this.port = port;

        this.server = new HTTP2Server({
            secure: false,
        });

        // add middlewares
        this.addMiddlewares();
    }




    /**
    * register middlewares on the server
    */
    addMiddlewares() {

        // cors
        this.server.registerMiddleware(async (request) => {
            request.response().setHeaders([
                ['Access-Control-Allow-Origin', (request.getHeader('origin') || '*')],
                ['Access-Control-Allow-Headers', 'select, filter'],
                ['Access-Control-Allow-Methods', 'GET, OPTIONS'],
                ['Access-Control-Allow-Credentials', 'true'],
            ]);

            if (request.method('options')) {
                request.response.status(200).send();
                return false;
            }
        });
    }




    async listen() {
        await this.server.load();
        await this.server.listen(this.port);
        console.log(`The server is listenign on port ${this.port}`);
    }





    /**
    * shut down the server
    */
    async close() {
        await this.server.close();
    }




    registerMiddleware(middleware) {
        this.server.registerMiddleware(middleware);
    }




    /**
     * return the servers router
     *
     * @return     {router}  The router.
     */
    getRouter() {
        return this.server.getRouter();
    }




    /**
    * returns the express app
    */
    getServer() {
        return this.server;
    }
}
