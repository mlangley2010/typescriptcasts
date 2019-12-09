import 'reflect-metadata';
import { Request, Response, RequestHandler, NextFunction } from 'express';
import { AppRouter } from '../../AppRouter';
import { Methods } from './Methods';
import { MetadataKeys } from './MetadataKeys';

function bodyValidators(keys: string): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
      res.status(422).send('Invalid request');
      return;
    }

    for (let key of keys) {
      if (!req.body[key]) {
        res.status(422).send(`Missing property ${key}`);
        return;
      }
    }

    next();
  };
}

// Decorators applied to the class take in the constructor function as the target
// Not the prototype that method decorators take ... but you can still get at the class prototype via this target
export function controller(routePrefix: string) {
  return function(target: Function) {
    const router = AppRouter.getInstance();

    for (let key in target.prototype) {
      // This is the actual function (method) that gets executed
      const routeHandler = target.prototype[key];

      // comes from routes.ts
      const path = Reflect.getMetadata(MetadataKeys.path, target.prototype, key);

      // comes from routes.ts
      const method: Methods = Reflect.getMetadata(MetadataKeys.method, target.prototype, key);

      // comes from use.ts
      const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) || [];

      // comes from bodyValidator.ts
      const requiredBodyProps = Reflect.getMetadata(MetadataKeys.validator, target.prototype, key) || [];

      // Validator middleware built from function above and build of the passed required body props
      const validator = bodyValidators(requiredBodyProps);

      // If there is a path, register this route
      // i.e. router.get('/auth/login', ...middlewareFunctions, bodyValidationMiddleware, (req, res, next) => {
      // do stuff
      //})
      if (path) {
        router[method](`${routePrefix}${path}`, ...middlewares, validator, routeHandler);
      }
    }
  };
}
