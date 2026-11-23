import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div>
          <b style={{ color: "var(--fg)" }}>MORT</b>
          <br />
          Local opportunity, with a little more thought behind it.
          <br />© 2026 MORT. Availability and features vary by location and account status.
        </div>
        <nav aria-label="Footer">
          <a href="https://mortapp.org/safety">Safety</a>
          <Link href="/legal/terms">Terms</Link>
          <a href="https://mortapp.org/legal/privacy">Privacy</a>
          <a href="https://mortapp.org/account-deletion">Delete account</a>
          <a href="https://mortapp.org/login">Sign in</a>
        </nav>
      </div>
    </footer>
  );
}
