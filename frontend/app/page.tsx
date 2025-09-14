"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useSearch } from "./contexts/SearchContext";
import SearchResultsGrid from "@/app/Components/SearchResultsGrid";
import styles from "@/app/landing/Landing.module.css";
import logo from "@/app/src/images/logo.svg";

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
          <a className="navTitle">FRAGMENTS</a>
        </div>
        <nav className={styles.nav}>
          {isLoading ? (
            <div className={styles.btn}>Loading...</div>
          ) : user ? (
            <>
              <a href="/fragments" className={styles.btn}>
                <span>Hello, {user.name}!</span>
              </a>
              <a className={styles.btn} href="/auth/logout">
                Logout
              </a>
            </>
          ) : (
            <>
              <a className={styles.btn} href="/auth/login?returnTo=/fragments">
                Log in
              </a>
              <a
                className={`${styles.btn} ${styles.btnPrimary}`}
                href="/auth/login?returnTo=/fragments"
              >
                Sign up
              </a>
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
        <a className={styles.cta} href="/extension">
          Get browser extension
        </a>
      </div>
    </main>
  );
}

export default LandingContent;
