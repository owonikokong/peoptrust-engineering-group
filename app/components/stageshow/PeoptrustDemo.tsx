'use client'

import { Avatar, Badge, Bar, Collapse, Count, Field, Icon, Row, Segmented, Stage, States, Swap, Text, Window, type Act } from './kit'
import './peoptrust.css'

// PeopTrust employer flow: post a job from the dashboard, and verified
// applications arrive. Built on the hero-demo layout (sidebar window,
// cursor choreography, poster = payoff).

type S = {
  form: boolean
  focus: 'title' | 'loc' | null
  title: string
  loc: string
  trade: number
  posting: boolean
  posted: boolean
  newJob: boolean
  apps: number
}

const initial: S = {
  form: false,
  focus: null,
  title: '',
  loc: '',
  trade: 1,
  posting: false,
  posted: false,
  newJob: false,
  apps: 0,
}

const POSTER: S = { ...initial, title: 'Mechanical Engineer', loc: 'Lagos', trade: 0, posted: true, newJob: true, apps: 3 }

const APPLICANTS = [
  { name: 'Tunde Adeyemi', line: 'Mechanical Engineer · Lagos' },
  { name: 'Sule Musa', line: 'Maintenance Fitter · Ikeja' },
  { name: 'Damilola Osei', line: 'Mechanical Tech · Ibadan' },
]

const REST = { wide: { x: 881, y: 471 }, compact: { x: 301, y: 521 } }

async function script(a: Act<S>) {
  a.place('rest')
  await a.wait(800)

  // Open the post-a-job form
  await a.move({ at: 'post', x: 0.87, y: 0.5 })
  await a.wait(300)
  await a.click()
  await a.set({ form: true })
  await a.wait(650)

  // Title
  await a.click('titleField')
  await a.set({ focus: 'title' })
  await a.type('title', 'Mechanical Engineer')
  await a.wait(250)

  // Trade: switch the segmented control to Mechanical
  await a.click('trade-0')
  await a.set({ trade: 0, focus: null })
  await a.wait(300)

  // Location
  await a.click('locField')
  await a.set({ focus: 'loc' })
  await a.type('loc', 'Lagos')
  await a.wait(300)

  // Post it: the button confirms on itself
  await a.move({ at: 'submit', x: 0.86, y: 0.5 })
  await a.wait(250)
  await a.click()
  await a.set({ posting: true, focus: null })
  await a.wait(800)
  await a.set({ posting: false, posted: true })
  await a.wait(600)

  // Back to the dashboard: the new job lands on top of the list
  await a.set({ form: false, newJob: true })
  await a.wait(800)

  // Verified applications arrive, one by one
  for (let i = 1; i <= 3; i++) {
    await a.set({ apps: i })
    await a.wait(750)
  }

  await a.move('rest')
  await a.wait(2400)

  // Loop reset
  await a.set({ ...initial })
  await a.wait(600)
}

export function PeoptrustDemo() {
  return (
    <Stage
      width={1040}
      height={560}
      compact={{ below: 720, width: 358, height: 620 }}
      initial={initial}
      poster={POSTER}
      script={script}
      cursor={{ at: REST }}
      tokens={{ '--ss-accent': '#0e7a4f', '--ss-font': 'var(--font-sans), "Segoe UI", system-ui, sans-serif' }}
      className="pt"
    >
      {(s) => (
        <>
          <Window
            url="peoptrust.vercel.app/dashboard"
            urlShape="pill"
            sidebar={
              <div className="pt-side">
                <div className="pt-wordmark">PeopTrust</div>
                <div className="pt-nav">
                  <span className="pt-navitem">Overview</span>
                  <span className="pt-navitem" data-on="true">My jobs</span>
                  <span className="pt-navitem">Applicants</span>
                  <span className="pt-navitem">Profile</span>
                </div>
                <div className="pt-sidefoot">
                  <Bar w={90} h={7} tone={2} />
                  <Bar w={64} h={7} tone={2} />
                </div>
              </div>
            }
            sidebarWidth={204}
            className="pt-window"
          >
            <div className="pt-main">
              <div className="pt-head">
                <Text className="pt-title">Employer dashboard</Text>
                <span className="pt-postbtn" data-target="post" data-cursor="pointer" data-hide={s.form || undefined}>
                  Post a job
                </span>
              </div>

              <div className="pt-kpis">
                {[58, 44, 66].map((w, i) => (
                  <div key={i} className="pt-kpi">
                    <Bar w={w} h={6} tone={3} />
                    <Bar w={30} h={16} r={3} tone={4} style={{ marginTop: 8 }} />
                  </div>
                ))}
              </div>

              <Collapse open={s.form}>
                <div className="pt-panel pt-formpanel">
                  <div className="pt-panelhead">
                    <Text className="pt-paneltitle">Post a job</Text>
                  </div>
                  <Field
                    label="Job title"
                    value={s.title}
                    placeholder="e.g. Mechanical Engineer"
                    focused={s.focus === 'title'}
                    box={{ 'data-target': 'titleField', 'data-cursor': 'ibeam' }}
                  />
                  <div className="pt-fieldlabel">Trade</div>
                  <Segmented
                    items={['Mechanical', 'Electrical', 'Welding', 'Civil']}
                    value={s.trade}
                    targets={['trade-0', 'trade-1', 'trade-2', 'trade-3']}
                    cursor="pointer"
                    className="pt-seg"
                  />
                  <Field
                    label="Location"
                    value={s.loc}
                    placeholder="City"
                    focused={s.focus === 'loc'}
                    box={{ 'data-target': 'locField', 'data-cursor': 'ibeam' }}
                  />
                  <span className="pt-submit" data-target="submit" data-cursor="pointer" data-done={s.posted || undefined}>
                    <States
                      value={s.posted ? 'done' : s.posting ? 'busy' : 'idle'}
                      states={{
                        idle: <span>Post job</span>,
                        busy: <span>Posting…</span>,
                        done: (
                          <span className="pt-done">
                            <Icon name="check" size={15} /> Posted
                          </span>
                        ),
                      }}
                    />
                  </span>
                </div>
              </Collapse>
                <div className="pt-panel">
                  <div className="pt-panelhead">
                    <Text className="pt-paneltitle">Your jobs</Text>
                  </div>
                  <Collapse open={s.newJob} reveal="drop">
                    <Row
                      className="pt-jobrow"
                      title={<Text>Mechanical Engineer</Text>}
                      subtitle={<Text className="pt-faint">Lagos · Full-time</Text>}
                      meta={<span className="pt-justnow">Just now</span>}
                    >
                      <Badge tone="success">Open</Badge>
                    </Row>
                  </Collapse>
                  <Row
                    className="pt-jobrow"
                    title={<Text>Welder — Plant Maintenance</Text>}
                    subtitle={<Text className="pt-faint">Sagamu · Full-time</Text>}
                    meta={<Text className="pt-faint">2 days ago</Text>}
                  >
                    <Badge>Open</Badge>
                  </Row>
                  <Row className="pt-jobrow" title={<Bar w={170} h={8} tone={3} />} subtitle={<Bar w={110} h={7} tone={2} />} meta={<Bar w={40} h={7} tone={2} />} />
                </div>

                <div className="pt-panel">
                  <div className="pt-panelhead">
                    <Text className="pt-paneltitle">Applicants</Text>
                    <span className="pt-count">
                      <Count value={s.apps} />
                    </span>
                  </div>
                  <Collapse open={s.apps === 0}>
                    <div className="pt-empty">
                      <Swap id={s.newJob ? 'waiting' : 'none'}>{s.newJob ? 'Waiting for applications…' : 'No applications yet'}</Swap>
                    </div>
                  </Collapse>
                  {APPLICANTS.map((p, i) => (
                    <Collapse key={p.name} open={s.apps > i} reveal="drop">
                      <Row
                        className="pt-approw"
                        lead={<Avatar name={p.name} size={34} />}
                        title={<Text>{p.name}</Text>}
                        subtitle={<Text className="pt-faint">{p.line}</Text>}
                        meta={<Text className="pt-faint">{i === 0 ? '2 min ago' : i === 1 ? '9 min ago' : '14 min ago'}</Text>}
                      >
                        <Badge className="pt-verified" icon={<Icon name="check" size={12} />}>
                          Verified
                        </Badge>
                      </Row>
                    </Collapse>
                  ))}
                  <Row className="pt-approw" lead={<Avatar plain size={34} />} title={<Bar w={120} h={8} tone={2} />} subtitle={<Bar w={150} h={7} tone={2} />} />
                </div>
            </div>
          </Window>
          <span data-target="rest" className="pt-rest" />
        </>
      )}
    </Stage>
  )
}
