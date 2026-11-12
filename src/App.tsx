import { useEffect, useRef, useState } from 'react'

const paths = [
  { id: 'ship', label: 'I ship', find: 'Proof of work', detail: 'Something real, with a link. Be specific about your part. “I had the idea” doesn’t count.' },
  { id: 'deep', label: 'I go deep', find: 'Self-driven obsession', detail: 'What you learned that nobody asked you to, how you learned it, and why it mattered.' },
  { id: 'disagree', label: 'I disagree', find: 'Actual conviction', detail: 'A belief most smart people around you reject. Independent thinking, not contrarianism for clout.' },
  { id: 'agency', label: 'I find a way', find: 'Agency', detail: 'Something you “shouldn’t” have got at your age, and how you got it. Not “my dad knew someone.”' },
]

const nodes = [
  { x: 15, y: 55, label: 'Nine spots', copy: 'Solo, or teams of up to three. Every person is judged individually.' },
  { x: 30, y: 22, label: 'Online', copy: 'Join from anywhere. It’s free.' },
  { x: 49, y: 51, label: 'Four weeks', copy: 'About 6–8 hours a week, live sessions included.' },
  { x: 67, y: 20, label: 'Ages 14–20', copy: 'At the start of the cohort.' },
  { x: 84, y: 58, label: 'Givers', copy: 'Everyone brings a real strength to the other eight.' },
  { x: 61, y: 82, label: 'Outcomes', copy: 'You say, specifically, what these four weeks should change.' },
  { x: 33, y: 84, label: 'Peers', copy: 'People who make things and think their own thoughts.' },
]

function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? 'mark mark--small' : 'mark'} viewBox="0 0 160 190" role="img" aria-label="ASB9 ace mark">
      <path d="M80 5C66 33 29 58 21 88c-7 26 11 46 34 42 7-1 13-5 18-10-2 20-10 38-24 54h62c-14-16-22-34-24-54 5 5 11 9 18 10 23 4 41-16 34-42C131 58 94 33 80 5Z" />
      <path className="mark-cut" d="M80 45v78M57 89h46" />
      <text x="80" y="102">9</text>
    </svg>
  )
}

function App() {
  const [activePath, setActivePath] = useState(0)
  const [activeNode, setActiveNode] = useState(2)
  const [cursor, setCursor] = useState({ x: -40, y: -40, active: false })
  const [hold, setHold] = useState(0)
  const holdTimer = useRef<number | null>(null)

  useEffect(() => {
    const move = (event: PointerEvent) => setCursor((c) => ({ ...c, x: event.clientX, y: event.clientY }))
    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      setCursor((c) => ({ ...c, active: !!target.closest('button, a, input, textarea') }))
    }
    const reset = () => setHold(0)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    window.addEventListener('pageshow', reset)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.14 },
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pageshow', reset)
      observer.disconnect()
    }
  }, [])

  const beginHold = () => {
    if (holdTimer.current) window.clearInterval(holdTimer.current)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.assign('/apply')
      return
    }
    const started = Date.now()
    holdTimer.current = window.setInterval(() => {
      const next = Math.min(100, ((Date.now() - started) / 900) * 100)
      setHold(next)
      if (next === 100) {
        if (holdTimer.current) window.clearInterval(holdTimer.current)
        window.location.assign('/apply')
      }
    }, 16)
  }

  const endHold = () => {
    if (holdTimer.current) window.clearInterval(holdTimer.current)
    holdTimer.current = null
    if (hold < 100) setHold(0)
  }

  return (
    <main>
      <div className={`cursor ${cursor.active ? 'cursor--active' : ''}`} style={{ transform: `translate3d(${cursor.x}px,${cursor.y}px,0)` }} />
      <header className="nav">
        <a className="wordmark" href="#top" aria-label="ASB9 Club home"><Mark small /> ASB9 <span>/ CLUB</span></a>
        <nav aria-label="Main navigation">
          <a href="#ethos">Ethos</a><a href="#network">Cohort</a><a href="#apply">Apply</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow hero-index">Cohort 01 · Applications open</p>
        <div className="hero-mark"><Mark /></div>
        <h1><span>For the ones</span><span>already in motion.</span></h1>
        <p className="hero-copy">A free, four-week online cohort for nine builders aged 14–20. Solo or teams of up to three. We pick people, not ideas.</p>
        <a className="scroll-cue" href="#ethos"><span>Enter the club</span><i /></a>
      </section>

      <section className="manifesto" id="ethos">
        <p className="eyebrow reveal">01 / The premise</p>
        <p className="manifesto-line reveal">You don't need<br />a <em>startup.</em></p>
        <p className="manifesto-line manifesto-line--right reveal">You need <em>proof</em><br />that you make things<br />and think for yourself.</p>
        <aside className="margin-note reveal">No co-founder needed.<br />No plan needed.<br />No resume lines.</aside>
      </section>

      <section className="discovery">
        <div className="section-head reveal">
          <p className="eyebrow">02 / What we look for</p>
          <p>Four things we read for.<br />None of them is a pitch deck.</p>
        </div>
        <div className="discovery-grid reveal">
          <div className="path-list" role="tablist" aria-label="What we look for">
            {paths.map((path, index) => (
              <button key={path.id} role="tab" aria-selected={activePath === index} onClick={() => setActivePath(index)}>
                <span>0{index + 1}</span>{path.label}<b>↗</b>
              </button>
            ))}
          </div>
          <div className="path-result" role="tabpanel" aria-live="polite">
            <p>We look for</p>
            <h2>{paths[activePath].find}</h2>
            <p>{paths[activePath].detail}</p>
            <span>ASB9 / SIGNAL {activePath + 1}</span>
          </div>
        </div>
      </section>

      <section className="network" id="network">
        <div className="section-head reveal">
          <p className="eyebrow">03 / The cohort</p>
          <p>Nine people. Four weeks. Online and free.</p>
        </div>
        <div className="network-stage reveal">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {nodes.slice(0, -1).map((node, i) => {
              const next = nodes[(i + 2) % nodes.length]
              return <line key={node.label} x1={node.x} y1={node.y} x2={next.x} y2={next.y} />
            })}
          </svg>
          {nodes.map((node, index) => (
            <button
              key={node.label}
              className={`node ${activeNode === index ? 'node--active' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setActiveNode(index)}
              onFocus={() => setActiveNode(index)}
              onClick={() => setActiveNode(index)}
              aria-label={`Explore ${node.label}`}
            ><i /><span>{node.label}</span></button>
          ))}
          <div className="node-detail">
            <span>0{activeNode + 1}</span>
            <h2>{nodes[activeNode].label}</h2>
            <p>{nodes[activeNode].copy}</p>
          </div>
        </div>
      </section>

      <section className="selection">
        <p className="eyebrow reveal">04 / Selection</p>
        <h2 className="reveal">Signal recognizes<br /><em>signal.</em></h2>
        <div className="selection-list reveal">
          <article><span>01</span><h3>Apply</h3><p>Eight short sections: proof of work, how you think, why ASB9, and a 60-second unscripted video.</p></article>
          <article><span>02</span><h3>We watch and read</h3><p>Your video first, then your answers. Forty honest words beat 150 polished ones.</p></article>
          <article><span>03</span><h3>We call you</h3><p>If we see someone who actually makes things and thinks their own thoughts, we’ll call you.</p></article>
        </div>
      </section>

      <section className="apply" id="apply">
        <div className="apply-intro reveal">
          <p className="eyebrow">05 / Knock</p>
          <h2>The door is<br /><em>not hidden.</em></h2>
          <p>Write like you talk. Short answers beat long ones. If it reads like a LinkedIn post or a ChatGPT answer, it goes to the bottom of the pile.</p>
        </div>
        <div className="apply-cta reveal">
          <p className="eyebrow">Cohort 01 · Applications open</p>
          <h3>We pick people, <em>not ideas.</em></h3>
          <p>You don’t need a startup, a co-founder, or a plan. You need proof that you make things, and a mind worth betting on.</p>
          <ul>
            <li><span>Spots</span>9</li>
            <li><span>Format</span>Solo or teams of up to 3</li>
            <li><span>Length</span>4 weeks · Online</li>
            <li><span>Cost</span>Free</li>
            <li><span>Ages</span>14–20</li>
          </ul>
          <a className="hold-hint" href="#hold"><b aria-hidden="true">↓</b><span>To start, press and hold the button at the bottom of this page.</span></a>
          <p className="privacy-note">It takes one second of intent. Eight short sections, one at a time. Your answers save as you go.</p>
        </div>
      </section>

      <footer>
        <div><Mark small /><span>ASB9 CLUB<br />Cohort 01 · Ages 14–20</span></div>
        <button
          id="hold"
          className="hold"
          onPointerDown={beginHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.location.assign('/apply')}
        >
          <span className="hold-fill" style={{ width: `${hold}%` }} />
          <span className="hold-copy">{hold > 0 ? 'Hold your intention' : 'Press and hold to apply'}</span>
        </button>
        <p>For people who make things<br />and think their own thoughts.</p>
      </footer>
    </main>
  )
}

export default App
