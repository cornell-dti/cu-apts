import axios from 'axios';

export const backendUrl = 'http://localhost:8080';

export default function get<T>(
  route: string,
  setState: (data: T) => void,
  setLoading: ((loading: boolean) => void) | undefined
) {
  axios
    .get(`${backendUrl}${route}`)
    .then((response) => {
      setState(response.data);
      if (setLoading !== undefined) {
        setLoading(false);
      }
    })
    .catch((error) => {
      console.log('error', error);
    });
}
