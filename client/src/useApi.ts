import { useEffect, useState } from "react";
import { CancelablePromise } from "./api";

interface UseApiReturn<T> {
  loading: boolean;
  data: T | null;
}

const useApi = <T>(call: CancelablePromise<T>, refreshKey?: number): UseApiReturn<T> => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);

  const fetchApi = (): void => {
    call
      .then((response) => {
        return response;
      })
      .then((json) => {
        console.log(json);
        setLoading(false);
        setData(json);
      })
      .catch((error) => {
        console.error("API call failed:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApi();
  }, [refreshKey]);

  return { loading, data };
};

export default useApi;
