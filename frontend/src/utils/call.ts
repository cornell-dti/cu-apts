import axios, { AxiosRequestConfig } from 'axios';

export type GetOptions<T> = {
  callback?: (data: T) => void;
  errorHandler?: () => void;
  body?: any;
};
/**
 * get – Sends a GET request to the specified backend API endpoint.
 *
 * @remarks
 * This function simplifies the process of making a GET request using Axios by only requiring the route as it will
 * handle the callback, error console log, and error handling for you. This function doesn't return a value but will
 * execute the callback function (if provided) with the response data if succesful.
 *
 * @param {string} route – The API endpoint to send the GET request to.
 * @param {GetOptions<T>} options – Optional paramters including: callback for handling the response, error handler
 * for handling request failures, and an optional request body.
 * @param {AxiosRequestConfig} inputConfig – Optional Axios configuration to customize the request.
 */

const get = <T>(route: string, options: GetOptions<T> = {}, inputConfig?: AxiosRequestConfig) => {
  const { callback, errorHandler, body } = options;
  const config: AxiosRequestConfig = body && {
    data: body,
  };
  axios
    .get<T>(route, { ...config, ...inputConfig })
    .then((response) => {
      callback && callback(response.data);
    })
    .catch((error) => {
      console.log('error', error);
      errorHandler && errorHandler();
    });
};

export { get };
