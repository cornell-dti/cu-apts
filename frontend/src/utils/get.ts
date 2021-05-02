import axios from 'axios';

export default function get<T>(
  route: string,
  setState: (data: T) => void,
  setLoading: ((loading: boolean) => void) | undefined = undefined
) {
  axios
    .get<T>(`${route}`)
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
