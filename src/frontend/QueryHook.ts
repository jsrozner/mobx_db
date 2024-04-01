// custom hook; wraps interactions with the database so that
// we can use reactquery on top of the clientDB

import { useEffect } from "react";
import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "react-query";

export const customUseQuery = <
  TData = unknown,
  TError = unknown,
  TQueryFnData = TData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData, TError> => {
  // ideally we would do something like register this hook with the API class - eg could receive an instance of accessor
  // and then when it accesses data, it is recorded that it is the one accessing

  const result = useQuery<TQueryFnData, TError, TData, TQueryKey>(
    queryKey,
    queryFn,
    options,
  );

  // todo(implement) register data to this hook (but note that I want this to be automatically done by the fetch system)

  useEffect(() => {
    // Effect for initial data load or data changes
    // Your logic here, e.g., marking previous data as in use

    return () => {
      // Cleanup function for when data changes or component unmounts
      // Perform cleanup tasks here, such as marking data as no longer in use
      // todo
      // markDataAsNoLongerUsed(queryKey);
    };
  }, [result.data]); // Depend on result.data to trigger effect on data change

  return result;
};
