import Link from "next/link";
import { CopyUsernameButton } from "@/components/CopyUsernameButton";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";
import { shortenAddress } from "@/lib/format";

type Props = {
  handle: string;
  owner?: string | null;
  status: string;
  href?: string;
};

export function OwnershipCard({ handle, owner, status, href }: Props) {
  return (
    <section className="ownership-card panel">
      <div className="ownership-card__top">
        <span className="section-kicker">Ownership Record</span>
        <UsernameStatusChip status={status} />
      </div>
      <h2>@{handle}</h2>
      <dl>
        <div>
          <dt>Owner</dt>
          <dd>{shortenAddress(owner)}</dd>
        </div>
        <div>
          <dt>Uniqueness</dt>
          <dd>One wallet claims one record at a time</dd>
        </div>
      </dl>
      <div className="ownership-card__actions">
        <CopyUsernameButton value={`@${handle}`} />
        {href ? (
          <Link className="ghost-link" href={href}>
            Open Detail
          </Link>
        ) : null}
      </div>
    </section>
  );
}
