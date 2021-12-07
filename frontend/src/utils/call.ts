import axios, { AxiosRequestConfig } from 'axios';

export type GetOptions<T> = {
  callback?: (data: T) => void;
  errorHandler?: () => void;
  body?: any;
};

const get = <T>(route: string, options: GetOptions<T> = {}) => {
  const { callback, errorHandler, body } = options;
  const config: AxiosRequestConfig = body && {
    data: body,
  };
  axios
    .get<T>(route, config)
    .then((response) => {
      callback && callback(response.data);
    })
    .catch((error) => {
      console.log('error', error);
      errorHandler && errorHandler();
    });
};

export { get };
