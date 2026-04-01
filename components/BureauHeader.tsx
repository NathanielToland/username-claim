import Link from "next/link";
import { TopTabs } from "@/components/TopTabs";
import { WalletButton } from "@/components/WalletButton";

export function BureauHeader() {
  return (
    <header className="bureau-header">
      <div className="bureau-header__inner">
        <Link href="/" className="bureau-brand">
          <span className="bureau-brand__mark">@</span>
          <div>
            <strong>username-claim</strong>
            <span>Handle Registry Bureau</span>
          </div>
        </Link>
        <TopTabs />
        <WalletButton />
      </div>
    </header>
  );
}
