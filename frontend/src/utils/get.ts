import axios from 'axios';

const backendUrl = 'http://localhost:8080';

export default function get<T>(route: string, setState: (data: T) => void) {
  axios
    .get<T>(`${backendUrl}${route}`)
    .then((response) => {
      setState(response.data);
    })
    .catch((error) => {
      console.log('error', error);
    });
}
