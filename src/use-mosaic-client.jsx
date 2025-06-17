import { makeClient, coordinator } from "@uwdata/mosaic-core";
import { useEffect, useState } from "react";

export function useMosaicClient(opts) {
  const { selection, prepare, query } = opts;
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState(undefined);

  useEffect(() => {
    const client = makeClient({
      coordinator: coordinator(),
      selection,
      prepare,
      query,
      queryResult: (data) => {
        setData(Array.from(data));
        setIsError(false);
        setIsPending(false);
      },
      queryPending: () => {
        setIsPending(true);
        setIsError(false);
      },
      queryError: () => {
        setIsPending(false);
        setIsError(true);
      },
    });

    return () => {
      client.destroy();
    };
    // prepare and query are defined once per client
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  return { data, isPending, isError };
}
