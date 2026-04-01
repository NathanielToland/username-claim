type Props = {
  value: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  disabled?: boolean;
};

export function UsernameClaimInput({ value, onChange, onCheck, disabled }: Props) {
  return (
    <section className="claim-console panel">
      <div className="claim-console__header">
        <span className="section-kicker">Registry Console</span>
        <p className="claim-console__hint">Enter a unique handle. Use letters, numbers, dots, or hyphens.</p>
      </div>
      <label className="claim-console__field">
        <span className="eyebrow">Username</span>
        <div className="claim-console__inputWrap">
          <span className="claim-console__prefix">@</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="enter-handle"
            maxLength={20}
            spellCheck={false}
          />
        </div>
      </label>
      <button type="button" className="secondary-button" onClick={onCheck} disabled={disabled}>
        Check Availability
      </button>
    </section>
  );
}
