import { MyUsernamePanel } from "@/components/MyUsernamePanel";

export default function MyPage() {
  return (
    <main className="page-frame my-page">
      <section className="my-page__intro panel">
        <span className="section-kicker">Personal Summary</span>
        <h1 className="page-title">My username record</h1>
        <p className="page-copy">Inspect the handle currently attached to the connected wallet.</p>
      </section>
      <MyUsernamePanel />
    </main>
  );
}
