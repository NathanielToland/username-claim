import clsx from "clsx";

export function UsernameStatusChip({ status }: { status: string }) {
  return <span className={clsx("status-chip", status)}>{status}</span>;
}
