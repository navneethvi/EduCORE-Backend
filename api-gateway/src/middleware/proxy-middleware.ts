import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '@/config/config';

interface Services {
  [key: string]: string;
}

const services: Services = {
  auth: config.USER_SERVICE_API,
};

export function createProxyService(serviceName: string) {
  const target = services[serviceName as keyof Services];

  if (!target) {
    throw new Error(`Service ${serviceName} not found`);
  }

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/${serviceName}`]: '',
    },
  });
}