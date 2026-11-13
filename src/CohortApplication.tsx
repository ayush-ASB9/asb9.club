import { FormEvent, useEffect, useRef, useState } from 'react'

type Answers = Record<string, string>

type Field = {
  id: string
  label: string
  kind: 'text' | 'email' | 'number' | 'url' | 'textarea' | 'choice'
  hint?: string
  lookingFor?: string
  placeholder?: string
  words?: number
  options?: string[]
  optional?: boolean
  show?: (answers: Answers) => boolean
}

type Section = { title: string; intro?: string; fields: Field[] }

const isMinor = (a: Answers) => a.age !== '' && Number(a.age) < 18
const isTeam = (a: Answers) => a.mode === 'Team'

const sections: Section[] = [
  {
    title: 'Basics',
    fields: [
      { id: 'fullName', label: 'Full name', kind: 'text', placeholder: 'First and last' },
      { id: 'email', label: 'Email', kind: 'email', placeholder: 'you@somewhere.com' },
      { id: 'age', label: 'Age', kind: 'number', hint: 'Must be 14–20 at the start of the cohort.' },
      { id: 'location', label: 'Country + timezone', kind: 'text', placeholder: 'India, IST (UTC+5:30)' },
      { id: 'currentStatus', label: 'What are you doing right now?', kind: 'textarea', hint: 'School, college, dropped out, working, building, whatever. Just be real.' },
      { id: 'links', label: 'Links', kind: 'textarea', hint: 'GitHub, X, personal site, YouTube, anything that shows your actual work.' },
      { id: 'guardianName', label: 'Parent/guardian name', kind: 'text', hint: 'Required because you are under 18. We only contact them if you are selected.', show: isMinor },
      { id: 'guardianEmail', label: 'Parent/guardian email', kind: 'email', show: isMinor },
    ],
  },
  {
    title: 'Solo or Team',
    fields: [
      { id: 'mode', label: 'Are you applying solo or as a team?', kind: 'choice', options: ['Solo', 'Team'], hint: 'Teams can have up to 3 people.' },
      { id: 'teammates', label: 'List your teammates’ names', kind: 'textarea', hint: 'Every teammate submits their own application. We judge each person individually.', show: isTeam },
      { id: 'teamStory', label: 'How did you meet? What does each person do that the others can’t?', kind: 'textarea', words: 75, hint: 'If your answers don’t match, we’ll notice.', show: isTeam },
    ],
  },
  {
    title: 'Proof of Work',
    intro: 'This is what matters.',
    fields: [
      { id: 'bestLink', label: 'What’s the best thing you’ve made? Link it.', kind: 'url', placeholder: 'https://' },
      { id: 'bestWhat', label: 'What is it? What exactly did you do?', kind: 'textarea', words: 150, hint: 'Be specific about your part. “I had the idea” doesn’t count.', lookingFor: 'Did you actually ship something? Do you know what you did?' },
      { id: 'afterShip', label: 'What happened after you shipped it?', kind: 'textarea', words: 100, hint: 'Users? Money? Views? Feedback? Numbers?', lookingFor: '“Nobody used it, turns out nobody cared” is better than bullshit metrics. But tell us why.' },
      { id: 'abandoned', label: 'Tell us about something you started and abandoned.', kind: 'textarea', words: 100, hint: 'What was it? Why’d you stop? No fluff, just honest.', lookingFor: 'Do you learn from failure or just make excuses?' },
    ],
  },
  {
    title: 'How You Think',
    fields: [
      { id: 'deepDive', label: 'What have you gone deep on recently that nobody asked you to?', kind: 'textarea', words: 150, hint: 'How did you learn it? Why did it matter?', lookingFor: 'Self-driven learning. Weird obsessions. Proof you think for yourself.' },
      { id: 'belief', label: 'What do you believe that most smart people around you disagree with?', kind: 'textarea', words: 100, lookingFor: 'Independent thinking. Not contrarianism for clout—actual conviction.' },
      { id: 'shouldntGet', label: 'Tell us about a time you got something you “shouldn’t” have been able to get at your age.', kind: 'textarea', words: 100, hint: 'Access, a meeting, a result, a deal, info, whatever. How’d you do it?', lookingFor: 'Resourcefulness. Not “my dad knew someone”—we want to see agency.' },
      { id: 'problem', label: 'What problem would you happily spend 5 years on?', kind: 'textarea', words: 100, hint: 'Don’t pitch a startup. Just describe the problem. Why does it matter to you?', lookingFor: 'Is there something you actually care about? Or are you just here for the resume line?' },
    ],
  },
  {
    title: 'Why ASB9',
    fields: [
      { id: 'success', label: 'What would make these 4 weeks a success for you?', kind: 'textarea', words: 75, hint: 'Be specific. Not “I want to meet other builders.” What actually changes?' },
      { id: 'bring', label: 'What will you bring to the other 8 people?', kind: 'textarea', hint: 'What’s your actual strength? What will you teach them or add to the cohort?', lookingFor: 'Honesty. Are you a giver or a taker?' },
      { id: 'commit', label: 'Can you commit ~6–8 hours a week for all 4 weeks, including live sessions?', kind: 'choice', options: ['Yes', 'No'] },
      { id: 'conflicts', label: 'List any conflicts', kind: 'textarea', hint: 'Exams, travel, etc.', optional: true },
    ],
  },
  {
    title: '60-Second Video',
    intro: 'Record a 60-second unscripted video of you talking about the thing you’re most proud of. Phone recording is fine. No editing, no slides, no script. Just you, talking. This is where we actually see who you are.',
    fields: [
      { id: 'videoLink', label: 'Video link', kind: 'url', placeholder: 'https://', hint: 'Upload it to YouTube (unlisted), Google Drive, or Loom and paste a link anyone can open.' },
    ],
  },
  {
    title: 'The Real You',
    fields: [
      { id: 'obsession', label: 'What’s something you’re weirdly obsessed with that makes no sense to other people?', kind: 'textarea', words: 50 },
      { id: 'threeAm', label: 'What do you think about at 3am?', kind: 'textarea', words: 50 },
      { id: 'friendsShocked', label: 'What would your closest friends be shocked to learn you actually care about?', kind: 'textarea', words: 50 },
      { id: 'anythingElse', label: 'Anything else we should know?', kind: 'textarea', hint: 'If something defines you and didn’t fit above, here’s your space.', optional: true },
    ],
  },
  {
    title: 'How Did You Hear About Us',
    fields: [{ id: 'heardFrom', label: 'Did anyone refer you? How’d you find ASB9?', kind: 'textarea' }],
  },
]

const allFields = sections.flatMap((s) => s.fields)
const emptyAnswers: Answers = Object.fromEntries(allFields.map((f) => [f.id, '']))
// Google Apps Script web app that writes each application to the Cohort 01 Sheet (see google-sheet/).
// It only adds rows, so it is safe to ship in the site; VITE_COHORT_APPLICATION_URL overrides it for testing.
const endpoint = import.meta.env.VITE_COHORT_APPLICATION_URL || 'https://script.google.com/macros/s/AKfycbypTJlGeeipJUBQ473ETmhB6qoMENySkleKglw49HceBum-E_kCaq7hqBb0kpdXoRbXwQ/exec'
const draftKey = 'asb9-cohort-01-draft'
const submissionIdKey = 'asb9-cohort-01-submission-id'
const reviewStep = sections.length

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length
const visible = (field: Field, answers: Answers) => !field.show || field.show(answers)

function validate(field: Field, answers: Answers): string | null {
  const value = answers[field.id].trim()
  if (!value) return field.optional ? null : 'This one is required.'
  if (field.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email.'
  if (field.kind === 'url' && !/^https?:\/\/\S+\.\S+/.test(value)) return 'Enter a full link starting with https://'
  if (field.id === 'age' && !(Number.isInteger(Number(value)) && Number(value) >= 14 && Number(value) <= 20)) return 'You must be 14–20 at the start of the cohort.'
  if (field.words && countWords(value) > field.words) return `Keep it to ${field.words} words.`
  return null
}

function sectionErrors(index: number, answers: Answers) {
  const errors: Record<string, string> = {}
  for (const field of sections[index].fields) {
    if (!visible(field, answers)) continue
    const error = validate(field, answers)
    if (error) errors[field.id] = error
  }
  return errors
}

function loadDraft(): { answers: Answers; step: number } {
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey) ?? 'null')
    if (saved?.answers) return { answers: { ...emptyAnswers, ...saved.answers }, step: Math.min(Number(saved.step) || 0, reviewStep) }
  } catch {}
  return { answers: emptyAnswers, step: 0 }
}

export default function CohortApplication() {
  const [initial] = useState(loadDraft)
  const [answers, setAnswers] = useState(initial.answers)
  const [step, setStep] = useState(initial.step)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'done'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'Apply · ASB9 Cohort 01'
  }, [])

  useEffect(() => {
    if (status !== 'done') localStorage.setItem(draftKey, JSON.stringify({ answers, step }))
  }, [answers, step, status])

  const goTo = (next: number) => {
    setErrors({})
    setStep(next)
    topRef.current?.scrollIntoView({ block: 'start' })
  }

  const next = (event: FormEvent) => {
    event.preventDefault()
    const found = sectionErrors(step, answers)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus()
      return
    }
    goTo(step + 1)
  }

  const update = (id: string, value: string) => {
    setAnswers((a) => ({ ...a, [id]: value }))
    if (errors[id]) setErrors(({ [id]: _, ...rest }) => rest)
  }

  const submit = async () => {
    const invalidSection = sections.findIndex((_, i) => Object.keys(sectionErrors(i, answers)).length > 0)
    if (invalidSection !== -1) {
      goTo(invalidSection)
      setErrors(sectionErrors(invalidSection, answers))
      return
    }

    const payload = Object.fromEntries(allFields.filter((f) => visible(f, answers)).map((f) => [f.id, answers[f.id].trim()]))
    // Reused across retries so a resend after a dropped connection doesn't add a second row.
    const submissionId = localStorage.getItem(submissionIdKey) ?? crypto.randomUUID()
    localStorage.setItem(submissionIdKey, submissionId)
    setStatus('submitting')
    try {
      // text/plain keeps this a simple request: Google Apps Script web apps can't answer a CORS preflight.
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ cohort: '01', submissionId, ...payload }),
      })
      const result: { ok?: boolean } = await response.json()
      if (!response.ok || result.ok !== true) throw new Error(String(response.status))
      localStorage.removeItem(draftKey)
      localStorage.removeItem(submissionIdKey)
      setStatus('done')
    } catch {
      setStatus('error')
      setStatusMessage('We could not send your application. Your answers are saved on this device; try again in a moment.')
    }
  }

  if (status === 'done') {
    return (
      <main className="cohort">
        <div className="cohort-shell cohort-done" role="status">
          <span className="cohort-eyebrow">ASB9 · Cohort 01</span>
          <h1>That’s it.</h1>
          <p>We’ll watch your video, read your answers, and if we see someone who actually makes things and thinks their own thoughts, we’ll call you.</p>
          <p className="cohort-serif">Good luck.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="cohort">
      <div className="cohort-shell" ref={topRef}>
        <header className="cohort-header">
          <a href="/" className="cohort-eyebrow">ASB9 · Cohort 01 Application</a>
          <span className="cohort-eyebrow">{step < reviewStep ? `Section ${String(step + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}` : 'Review'}</span>
        </header>
        <div className="cohort-progress" aria-hidden="true"><span style={{ width: `${(step / reviewStep) * 100}%` }} /></div>

        {step === 0 && (
          <div className="cohort-intro">
            <h1>We pick people, <em>not ideas.</em></h1>
            <p>You don’t need a startup, a co-founder, or a plan. You need proof that you make things, and a mind worth betting on.</p>
            <p className="cohort-facts">9 spots · Solo or teams of up to 3 · 4 weeks · Online · Free · Ages 14–20</p>
            <p className="cohort-howto"><strong>How to answer:</strong> Write like you talk. Short answers beat long ones. We’d rather read 40 honest words than 150 polished ones. If it reads like a LinkedIn post or a ChatGPT answer, it goes to the bottom of the pile.</p>
          </div>
        )}

        {step < reviewStep ? (
          <form className="cohort-form" onSubmit={next} noValidate>
            <h2>{sections[step].title}</h2>
            {sections[step].intro && <p className="cohort-section-intro">{sections[step].intro}</p>}
            {sections[step].fields.filter((f) => visible(f, answers)).map((field) => (
              <FieldInput key={field.id} field={field} value={answers[field.id]} error={errors[field.id]} onChange={(v) => update(field.id, v)} />
            ))}
            <div className="cohort-nav">
              {step > 0 ? <button type="button" className="cohort-back" onClick={() => goTo(step - 1)}>← Back</button> : <span />}
              <button type="submit" className="cohort-next">{step === reviewStep - 1 ? 'Review answers' : 'Continue'} →</button>
            </div>
            <p className="cohort-saved">Your answers are saved on this device as you type.</p>
          </form>
        ) : (
          <div className="cohort-form">
            <h2>Review</h2>
            <p className="cohort-section-intro">Read it once more. Then hit submit.</p>
            {sections.map((section, index) => (
              <section key={section.title} className="cohort-review">
                <div className="cohort-review-head">
                  <h3>{String(index + 1).padStart(2, '0')} · {section.title}</h3>
                  <button type="button" onClick={() => goTo(index)}>Edit</button>
                </div>
                <dl>
                  {section.fields.filter((f) => visible(f, answers)).map((field) => (
                    <div key={field.id}>
                      <dt>{field.label}</dt>
                      <dd>{answers[field.id].trim() || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            {status === 'error' && <p className="cohort-error" role="alert">{statusMessage}</p>}
            <div className="cohort-nav">
              <button type="button" className="cohort-back" onClick={() => goTo(step - 1)}>← Back</button>
              <button type="button" className="cohort-next" onClick={submit} disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting…' : 'Submit application'} →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function FieldInput({ field, value, error, onChange }: { field: Field; value: string; error?: string; onChange: (value: string) => void }) {
  const describedBy = `${field.id}-help`
  const words = countWords(value)
  return (
    <div className={`cohort-field ${error ? 'cohort-field--error' : ''}`}>
      <label htmlFor={field.id} id={`${field.id}-label`}>
        {field.label}
        {field.optional && <span className="cohort-optional"> (optional)</span>}
      </label>
      {field.hint && <p className="cohort-hint">{field.hint}</p>}
      {field.kind === 'choice' ? (
        <div className="cohort-choices" role="radiogroup" aria-labelledby={`${field.id}-label`} id={field.id} tabIndex={-1}>
          {field.options!.map((option) => (
            <label key={option} className={value === option ? 'is-selected' : ''}>
              <input type="radio" name={field.id} value={option} checked={value === option} onChange={() => onChange(option)} />
              {option}
            </label>
          ))}
        </div>
      ) : field.kind === 'textarea' ? (
        <textarea id={field.id} rows={field.words && field.words >= 100 ? 6 : 4} value={value} placeholder={field.placeholder} aria-invalid={!!error} aria-describedby={describedBy} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          id={field.id}
          type={field.kind}
          inputMode={field.kind === 'number' ? 'numeric' : undefined}
          min={field.kind === 'number' ? 14 : undefined}
          max={field.kind === 'number' ? 20 : undefined}
          autoComplete={field.id === 'fullName' ? 'name' : field.id === 'email' ? 'email' : 'off'}
          value={value}
          placeholder={field.placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <div className="cohort-meta" id={describedBy}>
        <span className="cohort-field-error">{error}</span>
        {field.words && <span className={words > field.words ? 'cohort-over' : ''}>{words} / {field.words} words</span>}
      </div>
      {field.lookingFor && <p className="cohort-looking"><span>We’re looking for</span> {field.lookingFor}</p>}
    </div>
  )
}
