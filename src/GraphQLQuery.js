import deepmerge from 'deepmerge';

export default class GraphQLQuery {



    constructor({
        name,
        isRootQuery = false,
    }) {
        this.name = name;
        this.isRootQuery = isRootQuery;

        this.filter = {};
        this.order = {};
        this.properties = new Set();
        this.children = [];
    }



    /**
     * stringify the query
     *
     * @return     {string}  String representation of the object.
     */
    toString() {
        return `
${this.isRootQuery ? '{' : ''}
    ${this.name}${this.getParameterString()} {
    ${this.getPropertyString()}
    ${this.suqQueryString()}
    }
${this.isRootQuery ? '}' : ''}
        `.trim();
    }




    /**
     * render the subqueries
     *
     * @return     {string}  the rendered subqueries
     */
    suqQueryString() {
        return this.children.map(subQuery => subQuery.toString()).join('\n');
    }



    /**
     * render the property string
     *
     * @return     {string}  The property string.
     */
    getPropertyString() {
        return Array.from(this.properties).join('\n');
    }




    /**
     * build the parameter string containing filter, limits, order bys etc
     *
     * @return     {string}  The parameter string.
     */
    getParameterString() {
        const parameters = [];

        if (this.hasFilters()) {
            parameters.push(`where: ${this.getFilterString()}`);
        }

        if (this.limit) {
            parameters.push(`limit: ${this.limit}`);
        }

        if (this.hasOrder()) {
            parameters.push(`order_by: ${this.getOrderString()}`);
        }


        if (parameters.length) {
            return `(${parameters.join(', ')})`;
        } else {
            return '';
        }
    }




    getOrderString() {
        if (this.hasOrder()) {
            return JSON.stringify(this.order).replace(/"/g, '');
        }
    }



    /**
     * create the GraphQLQuery filter string
     *
     * @return     {string}  GraphQLQuery filter string
     */
    getFilterString() {
        if (this.hasFilters()) {
            return JSON.stringify(this.filter).replace(/"/g, '');
        }
    }


    /**
     * cheks if there are filters set on the query
     *
     * @return     {boolean}  True if has filters, False otherwise.
     */
    hasFilters() {
        return Object.keys(this.filter).length > 0;
    }


    hasOrder() {
        return Object.keys(this.order).length > 0;
    }



    setLimit(limit) {
        this.limit = limit;
    }


    /**
     * Adds a property.
     *
     * @param      {string}  property  The property
     */
    addProperty(...properties) {
        for (const property of properties) {
            this.properties.add(property);
        }
    }



    /**
     * apply filters to the query
     *
     * @param      {<type>}  filter  The filter
     */
    applyFilter(filter) {
        this.filter = deepmerge(this.filter, filter);
    }

    /**
     * apply order to the query
     *
     * @param      {<type>}  filter  The filter
     */
    applyOrder(order) {
        this.order = {...this.order, ...order};
    }



    /**
     * add a subQuery to the query
     *
     * @param      {Object}  query   query instance
     */
    addChild(query) {
        this.children.push(query);
    }
}

