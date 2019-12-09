import express from 'express';

// Typescript singelton.
// Ensures that we only ever have one router instance available in our app
export class AppRouter {
  private static instance: express.Router;

  static getInstance(): express.Router {
    if (!AppRouter.instance) {
      AppRouter.instance = express.Router();
    }

    return AppRouter.instance;
  }
}
