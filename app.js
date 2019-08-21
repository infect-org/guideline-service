import GuidelelineService from './src/GuidelelineService.js';


const service = new GuidelelineService();


service.load().catch(console.log);