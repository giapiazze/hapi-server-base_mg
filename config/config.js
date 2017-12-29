const Confidence = require('confidence');
const Dotenv = require('dotenv');

Dotenv.config({ silent: true });

const criteria = {
  env: process.env.NODE_ENV
};

const constants = {
  USER_ROLES: {
    USER: 'User',
    ADMIN: 'Admin',
    SUPER_ADMIN: 'SuperAdmin',
  },
  AUTH_STRATEGIES: {
    PURE_TOKEN: 'standard-jwt-with-refresh',
    SESSION_TOKEN: 'jwt-with-session-for-refresh-token'
  },
	HOST: '127.0.0.1',
  PORT: 4000,
  APP_TITLE: 'Hapi Server Base'
};

const config = {
  $meta: 'This file configures Hapi Server Base.',
  projectName: constants.APP_TITLE,
  websiteName: 'Server Admin',
  port: {
    $filter: 'env',
    production: process.env.PORT,
    $default: constants.PORT
  },
  host: {
	  $filter: 'env',
	  production: process.env.HOST,
	  $default: constants.HOST
  },
  constants: constants,
  expirationPeriod: {
    short: '7d',
    medium: '30d',
    long: '90d'
  },
  authAttempts: {
    forIp: 50,
    forIpAndUser: 7
  },
  lockOutPeriod: 30, //in units of minutes
  jwtSecret: {
    $filter: 'env',
    production: process.env.JWT_SECRET,
    $default: '#mgtfYK@QuRV8-guardatecosavihoinventatoperfareunbelStrongJwtSecret-VMM7T>W;^fMVr)y'
  },
  nodemailer: {
    $filter: 'env',
    local: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'giapiazze@gmail.com',
        pass: process.env.SMTP_PASSWORD
      }
    },
    production: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'giapiazze@gmail.com',
        pass: process.env.SMTP_PASSWORD
      }
    }
  },
  /**
   * defaultEmail:
   * If set to null, outgoing emails are sent to their actual address,
   * otherwise outgoing emails are sent to the defaultEmail
   */
  defaultEmail: {
    $filter: 'env',
    local: 'giapiazze@gmail.com',
    development: 'giapiazze@gmail.com',
    production: 'giapiazze@gmail.com'
  },
  system: {
    fromAddress: {
      name: 'appy',
      address: 'giapiazze@gmail.com'
    },
    toAddress: {
      name: 'appy',
      address: 'giapiazze@gmail.com'
    }
  },
  clientURL: {
    $filter: 'env',
    local: 'http://localhost:' + constants.PORT,
    production: 'http://localhost:' + constants.PORT,
    $default: 'http://localhost:' + constants.PORT
  },

  serverHapiConfig: {
    appTitle: constants.APP_TITLE,
    cors: {
      additionalHeaders: ['X-Total-Count', 'X-Auth-Header', 'X-Refresh-Token'],
      additionalExposedHeaders: ['X-Total-Count', 'X-Auth-Header', 'X-Refresh-Token']
    },
    absoluteModelPath: true,
    modelPath: __dirname + '/server/api',
    absoluteApiPath: true,
    apiPath: __dirname + '/server/api',
    authStrategy: {
      $filter: 'env',
      local: constants.AUTH_STRATEGIES.PURE_TOKEN,
      $default: constants.AUTH_STRATEGIES.PURE_TOKEN
    },
    enableQueryValidation: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enablePayloadValidation: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enableResponseValidation: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enableTextSearch: {
      $filter: 'env',
      local: true,
      $default: true
    },
    enableSoftDelete: {
      $filter: 'env',
      local: true,
      $default: true
    },
    generateScopes: {
      $filter: 'env',
      local: true,
      $default: true
    },
    logLevel: {
      $filter: 'env',
      local: "DEBUG",
      $default: "ERROR"
    }

  }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

  return store.get(key, criteria);
};


exports.meta = function (key) {

  return store.meta(key, criteria);
};
