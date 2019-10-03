

export default class TenantFilter {

    // name as seen in the config file
    static name = '_forEach'


    // processes data, not queries
    isPostProcessor = true



    /**
     * process the data
     *
     * @param      {array}   data           The data
     * @param      {Object}  classInstance  The class instance
     * @return     {array}   the data
     */
    process(data, classInstance) {
        for (const item of data) {
            classInstance.execute(item);
        }

        return data;
    }
}