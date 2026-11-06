import { useEffect, useState } from "react";
import { formatHeaderClock } from "@/utils";
import { STATUS_HEADER_COPY } from "./constants";
import styles from "./StatusHeader.module.scss";

const MINUTE_MS = 60_000;

const StatusHeader = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId = 0;
    const delay = MINUTE_MS - (Date.now() % MINUTE_MS);
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
      intervalId = window.setInterval(() => {
        setNow(new Date());
      }, MINUTE_MS);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className={styles.header}>
      <p className={styles.header__lane}>{STATUS_HEADER_COPY.LANE}</p>
      <p className={styles.header__clock}>{formatHeaderClock(now)}</p>
    </header>
  );
};

export default StatusHeader;
