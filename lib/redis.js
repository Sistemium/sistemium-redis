"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getId = exports.zRangeByLex = exports.sIsMemberAsync = exports.sremAsync = exports.saddAsync = exports.execAsync = exports.hmsetAsync = exports.hincrbyAsync = exports.hsetAsync = exports.hgetallAsync = exports.hdelAsync = exports.hgetAsync = exports.rpushAsync = exports.lpushAsync = exports.ltrimAsync = exports.lremAsync = exports.lrangeAsync = exports.delAsync = exports.getAsync = exports.setAsync = exports.client = void 0;
// @ts-ignore
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
const sistemium_debug_1 = __importDefault(require("sistemium-debug"));
const { debug, error } = (0, sistemium_debug_1.default)('redis');
const IDS_HASH = 'ids';
const { REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_SOCK, REDIS_OFFLINE_QUEUE } = process.env;
const autoConnect = process.env.REDIS_AUTO_CONNECT !== "false";
const clientConfig = {
    db: REDIS_DB || 0,
    enable_offline_queue: !!REDIS_OFFLINE_QUEUE,
};
if (REDIS_SOCK) {
    clientConfig.path = REDIS_SOCK;
}
else {
    clientConfig.host = REDIS_HOST || '127.0.0.1';
    clientConfig.port = REDIS_PORT || 6379;
}
debug('init', autoConnect ? clientConfig : 'disabled');
exports.client = autoConnect && redis_1.default.createClient(clientConfig);
exports.setAsync = promisifyClient('set');
exports.getAsync = promisifyClient('get');
exports.delAsync = promisifyClient('del');
exports.lrangeAsync = promisifyClient('lrange');
exports.lremAsync = promisifyClient('lrem');
exports.ltrimAsync = promisifyClient('ltrim');
exports.lpushAsync = promisifyClient('lpush');
exports.rpushAsync = promisifyClient('rpush');
exports.hgetAsync = promisifyClient('hget');
exports.hdelAsync = promisifyClient('hdel');
exports.hgetallAsync = promisifyClient('hgetall');
exports.hsetAsync = promisifyClient('hset');
exports.hincrbyAsync = promisifyClient('hincrby');
exports.hmsetAsync = promisifyClient('hmset');
exports.execAsync = promisifyClient('exec');
exports.saddAsync = promisifyClient('sadd');
exports.sremAsync = promisifyClient('srem');
exports.sIsMemberAsync = promisifyClient('sismember');
exports.zRangeByLex = promisifyClient('zrangebylex');
function getId(name) {
    return (0, exports.hincrbyAsync)(IDS_HASH, name, 1);
}
exports.getId = getId;
if (autoConnect) {
    exports.client.on('error', (err) => {
        error('Error', err);
    });
    exports.client.on('connect', () => {
        debug('Redis connected');
    });
}
function promisifyClient(cmd) {
    return autoConnect && (0, util_1.promisify)(exports.client[cmd]).bind(exports.client);
}
