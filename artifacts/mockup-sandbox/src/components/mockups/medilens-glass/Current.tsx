import { ArrowRight, ArrowUpRight, BookOpen, HeartPulse, LockKeyhole, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import "./_group.css";

const tx = (value: string) => value;

function Brand() {
  return <span className="brandmark" aria-label="MediLens AI">
    <span className="brand-symbol"><span /><span /><span /></span>
    <span className="brand-name">medi<span>lens</span><i>AI</i></span>
  </span>;
}

function Button({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <button className={`button button-primary ${className}`} type="button">{children}</button>;
}

export function Current() {
  return <div className="landing-page">
    <header className="landing-header">
      <a href="#current-top" className="landing-brand"><Brand /></a>
      <nav aria-label="Page navigation" className="landing-links">
        <a href="#approach">Our approach</a><a href="#privacy">Privacy</a><a href="#how">How it works</a>
      </nav>
      <Button>{tx("Open MediLens")} <ArrowRight size={15} /></Button>
    </header>
    <main id="current-top">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-mark" /> A clearer conversation starts here</div>
          <h1 className="display-font">{tx("Medical language,")}<br /><em>{tx("made more human.")}</em></h1>
          <p className="hero-intro">{tx("Understand the words in a medical report, at your own pace. Then bring better questions to the person who knows your care.")}</p>
          <div className="hero-actions"><Button>{tx("Explore your workspace")} <ArrowRight size={16} /></Button><a href="#how" className="text-link">{tx("See how it works")} <ArrowUpRight size={15} /></a></div>
          <div className="hero-proof"><span><ShieldCheck size={15} /> Private by design</span><span><HeartPulse size={15} /> Made for learning</span></div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline"><span className="eyebrow">A MORE INFORMED NEXT STEP</span><span className="signal"><i /> <i /> <i /> CLEAR</span></div>
          <div className="visual-orbit orbital"><div className="orbit-core"><div className="core-cross">+</div><b>ML</b><small>UNDERSTAND</small></div><span className="orbit-tag tag-a">01 <b>Read</b></span><span className="orbit-tag tag-b">02 <b>Learn</b></span><span className="orbit-tag tag-c">03 <b>Discuss</b></span><span className="orbit-dot dot-a" /><span className="orbit-dot dot-b" /></div>
          <div className="visual-footer"><span>Clarity, without certainty claims.</span><span className="mono">FIG. 01 / YOUR REPORT, YOUR PACE</span></div>
          <div className="visual-stamp"><div>EDUCATION<br />NOT DIAGNOSIS</div><ShieldCheck size={19} /></div>
        </div>
      </section>
      <section className="principles" id="approach">
        <div className="section-heading"><div><span className="eyebrow">THE MEDILENS METHOD</span><h2 className="display-font">A guide, not a verdict.</h2></div><p>Medical reports are written for precision. Understanding them should feel more personal.</p></div>
        <div className="principle-layout">
          <article className="principle-lead"><span className="principle-index">01 — UNDERSTAND</span><div className="principle-mark"><BookOpen size={25} /></div><h3>Start with the words.</h3><p>Get clear, educational explanations of common medical terms, with the original language kept in view.</p><a href="#how" className="text-link">Browse the glossary <ArrowRight size={15} /></a></article>
          <div className="principle-list">
            <article><span className="principle-index">02 — KEEP CONTEXT</span><h3>Your report stays recognizable.</h3><p>Measurements and printed reference ranges are shown as they appear in the report—not reinterpreted.</p></article>
            <article><span className="principle-index">03 — PREPARE</span><h3>Make room for a better visit.</h3><p>Turn unfamiliar terminology into editable questions to discuss with a qualified clinician.</p></article>
            <article><span className="principle-index">04 — CHECK SOURCES</span><h3>Follow the evidence trail.</h3><p>Explore educational sources and see where additional context comes from.</p></article>
          </div>
        </div>
      </section>
      <section className="landing-callout" id="privacy">
        <div className="callout-orbital orbital"><span className="callout-center"><LockKeyhole size={27} /></span></div>
        <div className="callout-copy"><span className="eyebrow">PRIVATE BY DESIGN</span><h2 className="display-font">Your report is not a product.</h2><p>Uploads are processed transiently for text extraction. The file is not retained, and report content is never sent to an AI provider. Delete the active view any time to clear it from this session.</p><a href="#how" className="text-link">Explore privacy settings <ArrowRight size={15} /></a></div>
      </section>
      <section className="landing-last" id="how"><div className="eyebrow">A SMALL STEP TOWARD CLARITY</div><h2 className="display-font">Bring understanding<br />into the room.</h2><Button>{tx("Start with MediLens")} <ArrowRight size={16} /></Button><p>Not a diagnostic tool. Not a substitute for medical care.</p></section>
    </main>
    <footer className="landing-footer"><Brand /><span>© MediLens AI · Educational support for informed conversations</span><a href="#approach">Sources &amp; approach</a></footer>
  </div>;
}
