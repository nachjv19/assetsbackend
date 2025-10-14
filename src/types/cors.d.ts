declare module 'cors' {
  import { RequestHandler } from 'express';
  function cors(options?: any): RequestHandler;
  namespace cors {
    const jsonp: any;
  }
  export = cors;
}
