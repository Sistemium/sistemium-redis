// @ts-ignore
import redis from 'redis';
import { promisify } from 'util';
import log from 'sistemium-debug';

const { debug, error } = log('redis');
const IDS_HASH = 'ids';

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_DB,
  REDIS_SOCK,
  REDIS_OFFLINE_QUEUE
} = process.env;

const autoConnect = process.env.REDIS_AUTO_CONNECT !== "false";

const clientConfig: Record<string, any> = {
  db: REDIS_DB || 0,
  enable_offline_queue: !!REDIS_OFFLINE_QUEUE,
};

if (REDIS_SOCK) {
  clientConfig.path = REDIS_SOCK;
} else {
  clientConfig.host = REDIS_HOST || '127.0.0.1';
  clientConfig.port = REDIS_PORT || 6379;
}

debug('init', autoConnect ? clientConfig : 'disabled');

export const client = autoConnect && redis.createClient(clientConfig);

export const setAsync = promisifyClient('set');
export const getAsync = promisifyClient<string | undefined, [string]>('get');
export const delAsync = promisifyClient('del');
export const lrangeAsync = promisifyClient('lrange');
export const lremAsync = promisifyClient('lrem');
export const ltrimAsync = promisifyClient('ltrim');
export const lpushAsync = promisifyClient('lpush');
export const rpushAsync = promisifyClient('rpush');
export const hgetAsync = promisifyClient('hget');
export const hdelAsync = promisifyClient('hdel');
export const hgetallAsync = promisifyClient('hgetall');
export const hsetAsync = promisifyClient('hset');
export const hincrbyAsync = promisifyClient<number>('hincrby');
export const hmsetAsync = promisifyClient('hmset');
export const execAsync = promisifyClient('exec');
export const saddAsync = promisifyClient('sadd');
export const sremAsync = promisifyClient('srem');
export const sIsMemberAsync = promisifyClient('sismember');
export const zRangeByLex = promisifyClient('zrangebylex');


export function getId(name: string) {
  return hincrbyAsync(IDS_HASH, name, 1);
}

if (autoConnect) {
  client.on('error', (err: any) => {
    error('Error', err);
  });

  client.on('connect', () => {
    debug('Redis connected');
  });
}

export type RedisGeneric<T, ArgsT extends any[]> = (...args: ArgsT) => Promise<T>

function promisifyClient<T = any, ArgsT extends any[] = any[]>(cmd: string): RedisGeneric<T, ArgsT> {
  return autoConnect && promisify(client[cmd]).bind(client);
}
