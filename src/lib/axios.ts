import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      try {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/user/logout`,
          {},
          { withCredentials: true },
        );
      } catch {}

    }

    return Promise.reject(error);
  },
);

export default api;
