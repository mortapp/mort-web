import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div className="wrap">
        <Link className="logo" href="/" aria-label="MORT home">
          MORT
        </Link>
        <nav aria-label="Primary">
          <Link href="/#how">How it works</Link>
          <Link href="/#work">Work</Link>
          <Link href="/#safety">Safety</Link>
          <Link href="/#privacy">Privacy</Link>
          <Link href="/legal/terms">Legal</Link>
        </nav>
        <a className="signin" href="https://mortapp.org/login">
          Sign in
        </a>
        <a className="btn sm" href="https://mortapp.org/signup">
          Get started
        </a>
      </div>
    </header>
  );
}
