import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useCallback } from "react";

interface QueryParamsOptions {
  replace?: boolean;
  scroll?: boolean;
}

export const useQueryParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilters = useCallback(
    (key: string, value: string, options?: QueryParamsOptions) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value.trim() !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Using navigate to have more control over navigation behavior
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        {
          replace: options?.replace ?? false,
        },
      );
    },
    [searchParams, navigate, location.pathname],
  );

  const getParam = useCallback(
    (key: string) => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const getParamArray = useCallback(
    (key: string) => {
      return searchParams.getAll(key);
    },
    [searchParams],
  );

  const getAllParams = useCallback(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const clearAllParams = useCallback(
    (options?: QueryParamsOptions) => {
      navigate(
        {
          pathname: location.pathname,
          search: "",
        },
        {
          replace: options?.replace ?? false,
        },
      );
    },
    [navigate, location.pathname],
  );

  const setMultipleParams = useCallback(
    (params: Record<string, string>, options?: QueryParamsOptions) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      navigate(
        {
          pathname: location.pathname,
          search: newParams.toString(),
        },
        {
          replace: options?.replace ?? false,
        },
      );
    },
    [searchParams, navigate, location.pathname],
  );

  const removeParam = useCallback(
    (key: string, options?: QueryParamsOptions) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);

      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        {
          replace: options?.replace ?? false,
        },
      );
    },
    [searchParams, navigate, location.pathname],
  );

  return {
    updateFilters,
    getParam,
    getParamArray,
    getAllParams,
    clearAllParams,
    setMultipleParams,
    removeParam,
    searchParams,
    location,
  };
};
