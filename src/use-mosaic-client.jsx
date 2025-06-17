import { makeClient, coordinator } from "@uwdata/mosaic-core";
import { useRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

export function useMosaicClient(opts) {
  const { selection, prepare, query } = opts;
  const [isError, setIsError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState(undefined);
  const clientRef = useRef(null);

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

    clientRef.current = client;

    return () => {
      client.destroy();
    };
  }, [selection, prepare, query]);

  return { data, isPending, isError, client: clientRef.current };
}
