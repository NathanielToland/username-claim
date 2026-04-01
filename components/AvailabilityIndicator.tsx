import { UsernameStatusChip } from "@/components/UsernameStatusChip";

type Props = {
  status: "idle" | "checking" | "available" | "taken" | "claimed" | "pending" | "invalid";
  detail: string;
};

export function AvailabilityIndicator({ status, detail }: Props) {
  const statusLabel = status === "idle" ? "status" : status;

  return (
    <div className="availability-indicator panel">
      <div className="availability-indicator__header">
        <span className="eyebrow">Availability</span>
        <UsernameStatusChip status={statusLabel} />
      </div>
      <p>{detail}</p>
    </div>
  );
}
