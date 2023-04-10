import { useEffect } from "react";

export default function useMeta(title: string) {
  useEffect(() => {
    document.title = `${title} | Vanilla`;
  }, [title]);
}
