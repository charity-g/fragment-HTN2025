"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "./contexts/SearchContext";
import SearchResultsGrid from "@/app/Components/SearchResultsGrid";
import styles from "@/app/landing/Landing.module.css";
import logo from "@/app/src/images/logo.svg";
import Link from "next/dist/client/link";

// Regular Landing Content
function LandingContent() {
  const { user, isLoading } = useAuth();

  return (
    <main className={styles.landingBg} aria-hidden>
      {/* Top nav */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            src={logo}
            alt="Fragments logo"
            width={32}
            height={32}
            priority
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <Link className="navTitle" href="/fragments">FRAGMENTS</Link>
        </div>
        <nav className={styles.nav}>
          {isLoading ? (
            <div className={styles.btn}>Loading...</div>
          ) : user ? (
            <>
              <Link href="/fragments" className={styles.btn}>
                <span>Hello, {user.name}!</span>
              </Link>
              <Link className={styles.btn} href="/auth/logout">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link className={styles.btn} href="/auth/login?returnTo=/fragments">
                Log in
              </Link>
              <Link 
                className={`${styles.btn} ${styles.btnPrimary}`}
                href="/auth/login?returnTo=/fragments"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Giant headline */}
      <section className={styles.hero}>
        <h1 className={styles.headline}>
          A THOUSAND
          <br />
          WORDS SET
          <br />
          IN MOTION.
        </h1>
      </section>

      {/* Bottom caption & CTA */}
      <div className="landingFooter">
        <p className={styles.caption}>
          Clip the videos that spark your vision and never lose them.
        </p>
        <Link className={styles.cta} href="/extension">
          Get browser extension
        </Link>
      </div>
    </main>
  );
}

export default LandingContent;
