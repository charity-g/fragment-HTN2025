"use client";

import Image from "next/image";
import styles from "@/app/landing/Landing.module.css"
import logo from "@/app/src/images/logo.svg";

export default function Landing() {
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
      <div className="landingFooter">
        <p className={styles.caption}>
          Clip the videos that spark your vision and never lose them.
        </p>
        <a className={styles.cta} href="/extension">Get browser extension</a>
      </div>
    </main>
  );
}
