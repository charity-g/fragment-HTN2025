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
          YOUR
          <br />
          SECOND BRAIN
          <br />
          FOR VIDEOS.
        </h1>
        <p className={styles.subtitle}>Clip anything, anywhere.</p>
        <div className={styles.buttonGroup}>
          <a className={styles.cta} href="#demo">
            See how it works
          </a>
          <a className={styles.ctaSecondary} href="/">
            Get browser extension
          </a>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className={styles.demoSection}>
        <div className={styles.demoContent}>
          <h2 className={styles.demoTitle}>How it works</h2>
          <div className={styles.gifContainer}>
            <img
              src="/demo/Ewan Jones Morris - Flash Cut.gif"
              alt="Demo of Fragments in action"
              className={styles.demoGif}
            />
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className={styles.manifestoSection}>
        <div className={styles.manifestoContent}>
          <h2 className={styles.manifestoTitle}>Our Manifesto</h2>
        </div>
      </section>

      {/* Section 1: Stand on the Shoulder of Giants */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.textColumn}>
            <h3 className={styles.sectionTitle}>
              01. Stand on the Shoulder of Giants.
            </h3>
            <p className={styles.sectionText}>
              Great work is connected. <br></br>
              <br></br> Anything you ever make is produced by drawing on
              everything you've ever consumed. <br></br>
              <br></br> Being a better creator begins with being a better
              consumer.
            </p>
          </div>
          <div className={styles.imageColumn}>
            <img
              src="/Network_Community_Structure.svg"
              alt="Network community structure"
              className={styles.sectionImage}
            />
          </div>
        </div>
      </section>

      {/* Section 2: Curate Incrementally */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.imageColumn}>
            <img
              src="/logos.png"
              alt="Platform logos"
              className={`${styles.sectionImage} ${styles.smallImage}`}
            />
          </div>
          <div className={styles.textColumn}>
            <h3 className={styles.sectionTitle}>02. Curate Incrementally</h3>
            <p className={styles.sectionText}>
              Blank Page Syndrome is universal across creative domains.{" "}
              <br></br>
              <br></br> The cure?<br></br> <br></br> To leave precise fragments
              of the best work you find across the internet for your future
              self.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: A Video is Worth a Million Words */}
      <section className={styles.contentSection}>
        <div className={styles.contentContainer}>
          <div className={styles.textColumn}>
            <h3 className={styles.sectionTitle}>
              03. A Video is Worth a Million Words
            </h3>
            <p className={styles.sectionText}>
              Whether you're learning frontend development animations,
              post-production visual effects, hip-hop dance, or circus juggling
              — the magic of great work is best captured in video.
            </p>
          </div>
          <div className={styles.imageColumn}>
            <img
              src="/demo/Ewan Jones Morris - Flash Cut.gif"
              alt="Video demonstration"
              className={styles.sectionImage}
            />
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className={styles.footerSection}>
        <div className={styles.footerContent}>
          <h2 className={styles.footerTitle}>Ready to start fragmenting?</h2>
          <a className={styles.cta} href="/">
            Get browser extension
          </a>
        </div>
      </section>
    </main>
  );
}

export default LandingContent;
