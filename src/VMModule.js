import vm from 'vm';



export default class VMModule {

    constructor({
        sourceCode,
    }) {
        this.sourceCode = sourceCode;
    }



    /**
    * execute computation
    */
    async execute(data) {
        const instance = new this.Constructor();
        return await instance.execute(data);
    }



    /**
    * build an es6 module
    */
    async load() {
        this.context = vm.createContext({console});
        this.module = new vm.SourceTextModule(this.sourceCode, {
            context: this.context
        });

        // linking is not supported for the moment
        await this.module.link(async () => {});


        this.module.instantiate();

        const {result} = await this.module.evaluate();
        this.Constructor = result;
    }
}