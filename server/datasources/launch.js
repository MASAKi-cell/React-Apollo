const { RESTDataSource } = require('apollo-datasource-rest');

class LaunchAPI extends RESTDataSource {
    
    /**
     * baseURLの設計
     */
    constructor(){
        super();
        this.baseURL = 'https://api.spacexdata.com/v2/';
    }
}

module.exports = LaunchAPI;