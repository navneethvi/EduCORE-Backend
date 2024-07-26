import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { config } from '@/config/config';

interface Services {
  [key: string]: string;
}

const services: Services = {
  auth: config.USER_SERVICE_API,
};

interface ExtendedOptions extends Options {
    onProxyReq?: (proxyReq: any, req: any, res: any) => void;
  }

export function createProxyService(serviceName: string) {
  const target = services[serviceName as keyof Services];

  if (!target) {
    throw new Error(`Service ${serviceName} not found`);
  }

  const options: ExtendedOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/auth`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to ${target}`);
    },
  };

  return createProxyMiddleware(options);
}