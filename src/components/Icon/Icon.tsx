import clsx from "clsx";
import { icons } from "./icons";
import type { IconProps } from "./types";
import styles from "./Icon.module.scss";

const Icon = ({ name, width, height, className }: IconProps) => {
  const icon = icons[name];

  return (
    <svg
      className={clsx(styles.icon, className)}
      width={width}
      height={height}
      viewBox={icon.viewBox}
      fill="none"
      aria-hidden="true"
      stroke="currentColor"
      strokeLinecap={icon.roundCap ? "round" : undefined}
      strokeLinejoin={icon.roundJoin ? "round" : undefined}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} strokeWidth={icon.strokeWidth} />
      ))}
    </svg>
  );
};

export default Icon;
