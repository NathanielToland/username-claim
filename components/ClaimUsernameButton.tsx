type Props = {
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
};

export function ClaimUsernameButton({ disabled, busy, onClick }: Props) {
  return (
    <button className="claim-button" disabled={disabled || busy} onClick={onClick}>
      {busy ? "Submitting Claim..." : "Claim Username"}
    </button>
  );
}
