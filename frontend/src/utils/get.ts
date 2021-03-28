import axios from 'axios';

export default function get<T>(route: string, setState: (data: T[]) => void) {
  axios
    .get(`http://localhost:8080${route}`)
    .then((response) => {
      setState(response.data);
    })
    .catch((error) => {
      console.log('error', error);
    });
}
