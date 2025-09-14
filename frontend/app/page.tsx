"use client";

import styles from "@/app/landing/Landing.module.css"

export default function Landing() {
  return (
    <main className={styles.landingBg}>

      {/* Top nav */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span aria-hidden>◆</span>
          <span>FRAGMENTS</span>
        </div>
        <nav className={styles.nav}>
          <a className={styles.btn} href="/login">Log in</a>
          <a className={`${styles.btn} ${styles.btnPrimary}`} href="/signup">Sign up</a>
        </nav>
      </header>

      {/* Giant headline */}
      <section className={styles.hero}>
        <h1 className={styles.headline}>
          A THOUSAND<br/>WORDS SET<br/>IN MOTION.
        </h1>
      </section>

      {/* Bottom caption & CTA */}
      <p className={styles.caption}>
        Clip the videos that spark your vision and never lose them.
      </p>
      <a className={styles.cta} href="/extension">Get browser extension</a>
    </main>
  );
}
