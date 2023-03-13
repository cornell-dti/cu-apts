export class SessionStore {
  get(key: string) {
    const item = localStorage.getItem(key);
    return !item ? undefined : JSON.parse(item);
  }

  set(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  setPersistent(items: { [key: string]: any }) {
    Object.entries(items).forEach(([key, value]) =>
      localStorage.setItem(key, JSON.stringify(value))
    );
  }
}

export const Session = new SessionStore();
