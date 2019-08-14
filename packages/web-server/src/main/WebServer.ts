/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import express from 'express';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import * as http from 'http';
import logdown from 'logdown';

import {Config} from './Config';
import {CommitRoute} from './defaultRoutes/CommitRoute';
import {ConfigRoute} from './defaultRoutes/ConfigRoute';
import {DefaultRoute} from './defaultRoutes/DefaultRoute';
import {ErrorRoute} from './defaultRoutes/ErrorRoute';
import {HealthRoute} from './defaultRoutes/HealthCheckRoute';

export abstract class WebServer {
  private readonly logger: logdown.Logger;
  private readonly config: Config;
  private readonly app: express.Application;
  private server?: http.Server;

  constructor(options: {config: Config}) {
    this.logger = logdown('@wireapp/web-server/WebServer', {
      logger: console,
      markdown: false,
    });
    this.app = express();
    this.config = {...options.config};
    this.logger.info('Starting server with config: ', this.config);
    this.init();
  }

  private init(): void {
    // The order is important here, please don't sort!
    if (this.config.SERVER.BASIC_AUTH.ENABLE) {
      this.app.use(
        basicAuth({
          challenge: true,
          users: {
            [this.config.SERVER.BASIC_AUTH.USERNAME]: this.config.SERVER.BASIC_AUTH.PASSWORD,
          },
        }),
      );
    }
    this.initCaching();
    this.initForceSSL();
    this.initSecurityHeaders();

    this.register(this.app, this.config);

    this.app.use(HealthRoute(this.config));
    this.app.use(ConfigRoute(this.config));
    this.app.use(CommitRoute(this.config));
    this.app.use(DefaultRoute(this.config));
    this.app.use(ErrorRoute(this.config));
  }

  abstract register(app: express.Application, config: Config): void;

  initCaching(): void {
    if (this.config.SERVER.ENVIRONMENT === 'test' || this.config.SERVER.ENVIRONMENT === 'development') {
      this.app.use(helmet.noCache());
    } else {
      this.app.use((req, res, next) => {
        res.header('Cache-Control', `public, max-age=${this.config.SERVER.CACHE_DURATION_SECONDS}`);
        const milliSeconds = 1000;
        res.header(
          'Expires',
          new Date(Date.now() + this.config.SERVER.CACHE_DURATION_SECONDS * milliSeconds).toUTCString(),
        );
        next();
      });
    }
  }

  initForceSSL(): void {
    const STATUS_CODE_MOVED = 301;

    const SSLMiddleware: express.RequestHandler = (req, res, next) => {
      // Redirect to HTTPS
      if (!req.secure || req.get('X-Forwarded-Proto') !== 'https') {
        if (
          !this.config.SERVER.ENFORCE_HTTPS ||
          this.config.SERVER.ENVIRONMENT === 'test' ||
          this.config.SERVER.ENVIRONMENT === 'development' ||
          req.url.match(/health\/?/)
        ) {
          return next();
        }
        return res.redirect(STATUS_CODE_MOVED, `https://${req.headers.host}${req.url}`);
      }
      next();
    };

    this.app.enable('trust proxy');
    this.app.use(SSLMiddleware);
  }

  initSecurityHeaders(): void {
    this.app.disable('x-powered-by');
    this.app.use(
      helmet({
        frameguard: {action: 'deny'},
      }),
    );
    this.app.use(
      helmet.hsts({
        includeSubDomains: true,
        maxAge: 31536000,
        preload: true,
      }),
    );
    this.app.use(helmet.noSniff());
    this.app.use(helmet.xssFilter());
    this.app.use(
      helmet.contentSecurityPolicy({
        browserSniff: true,
        directives: this.config.SERVER.CSP,
        disableAndroid: false,
        loose: this.config.SERVER.ENVIRONMENT !== 'development',
        reportOnly: false,
        setAllHeaders: false,
      }),
    );
    this.app.use(
      helmet.referrerPolicy({
        policy: 'same-origin',
      }),
    );
    this.app.use(
      helmet.expectCt({
        maxAge: 0,
      }),
    );
  }

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        reject('Server is already running.');
      } else if (this.config.SERVER.PORT_HTTP) {
        this.server = this.app.listen(this.config.SERVER.PORT_HTTP, () => resolve(this.config.SERVER.PORT_HTTP));
      } else {
        reject('Server port not specified.');
      }
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = undefined;
    } else {
      throw new Error('Server is not running.');
    }
  }
}
