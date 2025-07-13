import {useEffect} from "react";

export default function useMeta(title: string) {
  useEffect(() => {
    document.title = `${title} | ${import.meta.env.VITE_APP_NAME}`;
  }, [title]);
}
