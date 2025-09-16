"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/app/landing/Landing.module.css";
import logo from "@/app/src/images/logo.svg";
import Link from "next/dist/client/link";
import { useState } from "react";

// Regular Landing Content
function LandingContent() {
  const productLive = false;
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");

  return (
    <main>
      <div className={styles.landingBg}>
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
            {productLive && (isLoading ? (
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
            ))}
          </nav>  
        </header>

        {/* Giant headline */}
        <section
          id="waitlist-form"
          className={styles.hero}>
          <h1 className={styles.headline}>
            YOUR
            <br />
            SECOND BRAIN
            <br />
            FOR VIDEOS.
          </h1>
          <p className={styles.subtitle}>Clip anything, anywhere.</p>
      
            {productLive && ( <div className={styles.buttonGroup}><Link className={styles.cta} href="#demo">
              See how it works
            </Link>
            <Link className={styles.ctaSecondary} href="/">
              Get browser extension
            </Link></div>) }
            
        </section>
         {!productLive && (
                <form
                  className={`${styles.buttonGroup} z-10 flex flex-col gap-4 md:flex-row md:gap-2 pb-20`}
                  onSubmit={() => 'TODO'}
                >
                  <input
                    className={styles.ctaSecondary}
                    placeholder="Enter your email"
                    type="text"
                    style={{ pointerEvents: "auto" }}
                    tabIndex={0}
                    autoComplete="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <button type='submit' className={styles.cta}>
                    Join the waitlist
                  </button>
                </form>
            )}
      </div>

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
              everything you&apos;ve ever consumed. <br></br>
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
        <div className={`${styles.contentContainer} ${styles.reverseOnMobile}`}>
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
              Whether you&apos;re learning frontend development animations,
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
          {productLive ? <Link className={styles.cta} href="/">
            Get browser extension
          </ Link> :
          <Link className={styles.cta} href="#waitlist-form">
            Join the waitlist
          </ Link>
          
        }
        </div>
      </section>
    </main>
  );
}

export default LandingContent;
