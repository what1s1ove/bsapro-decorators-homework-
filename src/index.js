import {ApiPath, AppConfig, HttpMethod, LogLevel} from './common/enums/enums.js'
import {handleRoute, logger} from './decorators/decorators.js'
import {server} from './server.js'

const initLogger = (cb, logLevel) => {
  return (req, res) => {
    const { method, url } = req;

    console.log(`Log Level: ${logLevel} Method: ${method} URL: ${url}`);

    cb.call(null, req, res);
  };
};

const initDebounce = (cb, delay) => {
  let lastTimeout = null;

  return (...args) => {
    clearInterval(lastTimeout);

    lastTimeout = setTimeout(() => cb.call(null, ...args), delay);
  };
};

const initHandler = (cb, options) => {
  const { method, path } = options;
  //
  // server.route({
  //   method,
  //   url: path,
  //   handler: cb,
  // });

  return cb;
};

class Application {
  constructor() {
    this.handleUsersGet = initHandler(
      initLogger(this.handleUsersGet, LogLevel.LOG),
      {
        method: HttpMethod.GET,
        path: ApiPath.USERS,
      }
    );
    this.handleUserCreate = initHandler(
      initLogger(this.handleUserCreate, LogLevel.WARNING),
      {
        method: HttpMethod.POST,
        path: ApiPath.USERS,
      }
    );
    this.initDbConnection = initDebounce(this.initDbConnection, 5000);
  }

  @logger(LogLevel.LOG)
  @handleRoute({
    method: HttpMethod.GET,
    path: ApiPath.USERS,
  })
  handleUsersGet(_req, res) {
    return res.send([]);
  }

  @logger(LogLevel.WARNING)
  @handleRoute({
    method: HttpMethod.POST,
    path: ApiPath.USERS,
  })
  handleUserCreate(req, res) {
    return res.send(req.body);
  }

  initDbConnection() {
    console.log("DB connection was success!");
  }

  async init() {
    await server.listen(AppConfig.PORT);

    this.initDbConnection();
  }
}

new Application().init().catch(console.error);
