import Link from "next/link";

export function EmptyState({
  title,
  detail,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  detail: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section className="empty-state panel">
      <span className="section-kicker">No Record</span>
      <h2>{title}</h2>
      <p>{detail}</p>
      <Link className="secondary-button" href={ctaHref}>
        {ctaLabel}
      </Link>
    </section>
  );
}
