import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useStrings, useCurrencyFormatter } from '../i18n/useStrings'
import PageTransition from '../components/PageTransition'
import {
  MapPin,
  Phone,
  Camera,
  Plus,
  CaretRight,
  CheckCircle,
} from '@phosphor-icons/react'
import styles from '../styles/MasterHome.module.css'

// Worker home: one active job is the hero, the rest of the day is secondary.
// Answers the three questions a master has on opening: where am I going,
// what's the job, and how much is mine. "Your cut" = workCost (labor fee);
// materials are pass-through (reimbursed at cost), so they're not earnings.
export default function MasterHome() {
  const navigate = useNavigate()
  const { state } = useApp()
  const strings = useStrings()
  const formatCurrency = useCurrencyFormatter()

  const master = state.masters.find((m) => m.id === state.selectedMasterId)

  // No master in context (e.g. direct nav / reload) -> back to the entry.
  useEffect(() => {
    if (!master) navigate('/', { replace: true })
  }, [master, navigate])
  if (!master) return null

  const t = strings.home
  const fill = (str, vars) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), str)

  const myJobs = state.jobs.filter((j) => j.assignedMasterId === master.id)
  const openJobs = myJobs.filter((j) => j.status !== 'completed')
  const doneCount = myJobs.length - openJobs.length

  // Active job = the one in progress; else the earliest still-new job.
  const activeJob =
    openJobs.find((j) => j.status === 'in_progress') ||
    [...openJobs]
      .filter((j) => j.status === 'new')
      .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate))[0] ||
    null

  const restJobs = openJobs.filter((j) => j.id !== activeJob?.id)
  const dayEarnings = openJobs.reduce((sum, j) => sum + (j.workCost || 0), 0)

  const expensesFor = (jobId) =>
    state.expenses
      .filter((e) => e.jobId === jobId)
      .reduce((s, e) => s + Math.round(e.quantity * e.unitPrice * 100) / 100, 0)

  const timeOf = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const statusClass = {
    new: styles.stNew,
    in_progress: styles.stInProgress,
    completed: styles.stDone,
  }

  const openMaps = (address) =>
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    )

  return (
    <PageTransition>
      <div className={styles.container}>
        <div className={styles.greeting}>
          <span className={styles.hi}>{master.name}</span>
          <span className={styles.date}>
            {new Date().toLocaleDateString([], {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>

        {activeJob ? (
          <>
            {/* ── HERO: the one job that matters right now ── */}
            <section
              className={`${styles.hero} interactive`}
              onClick={() => navigate(`/jobs/${activeJob.id}`)}
              role="button"
              tabIndex={0}
              aria-label={`${activeJob.address} — ${strings.status[activeJob.status === 'in_progress' ? 'inProgress' : 'new']}`}
            >
              <span
                className={`${styles.statusBlock} ${statusClass[activeJob.status]}`}
              >
                {activeJob.status === 'in_progress' ? t.labelActive : t.labelNext}
              </span>

              <button
                className={styles.address}
                onClick={(e) => {
                  e.stopPropagation()
                  openMaps(activeJob.address)
                }}
                aria-label={strings.jobDetail.openMap}
              >
                <MapPin size={22} weight="bold" className={styles.addrIcon} />
                <span>{activeJob.address}</span>
              </button>

              <p className={styles.scope}>
                <span className={styles.workType}>{activeJob.workType}</span>
                {' — '}
                {activeJob.workDescription}
              </p>

              {/* Money: your cut is the hero number; client/materials are context */}
              <div className={styles.moneyRow}>
                <div>
                  <div className={styles.cutLabel}>{t.yourCut}</div>
                  <div className={`${styles.cutValue} money`}>
                    {formatCurrency(activeJob.workCost || 0)}
                  </div>
                </div>
                <div className={styles.moneyContext}>
                  <div>
                    {fill(t.clientPays, {
                      amount: formatCurrency(
                        (activeJob.workCost || 0) + expensesFor(activeJob.id)
                      ),
                    })}
                  </div>
                  {expensesFor(activeJob.id) > 0 && (
                    <div>
                      {fill(t.materialsReimbursed, {
                        amount: formatCurrency(expensesFor(activeJob.id)),
                      })}
                    </div>
                  )}
                </div>
              </div>

              <a
                className={styles.phone}
                href={`tel:${activeJob.contactPhone.replace(/[^+\d]/g, '')}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Phone size={20} weight="bold" />
                <span>{activeJob.contactName} · {activeJob.contactPhone}</span>
              </a>

              {/* Primary action + two-tap logging straight from home */}
              <div className={styles.actions}>
                <button
                  className={`${styles.cta} interactive`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(
                      activeJob.status === 'in_progress'
                        ? `/jobs/${activeJob.id}/summary`
                        : `/jobs/${activeJob.id}`
                    )
                  }}
                >
                  {activeJob.status === 'in_progress' ? t.reportDone : t.start}
                </button>
                <button
                  className={`${styles.quick} interactive`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/jobs/${activeJob.id}/photos`)
                  }}
                  aria-label={t.quickPhoto}
                >
                  <Camera size={22} weight="bold" />
                  <span>{t.quickPhoto}</span>
                </button>
                <button
                  className={`${styles.quick} interactive`}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/jobs/${activeJob.id}/expenses`)
                  }}
                  aria-label={t.quickMaterial}
                >
                  <Plus size={22} weight="bold" />
                  <span>{t.quickMaterial}</span>
                </button>
              </div>
            </section>

            {/* ── Rest of today (secondary) ── */}
            {restJobs.length > 0 && (
              <div className={styles.restSection}>
                <h2 className={styles.restTitle}>{t.restOfDay}</h2>
                <ul className={styles.restList}>
                  {restJobs.map((job) => (
                    <li key={job.id}>
                      <button
                        className={`${styles.restRow} interactive`}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <span className={styles.restTime}>
                          {timeOf(job.createdDate)}
                        </span>
                        <span className={styles.restAddr}>{job.address}</span>
                        <span
                          className={`${styles.restStatus} ${statusClass[job.status]}`}
                        />
                        <CaretRight
                          size={16}
                          weight="bold"
                          className={styles.restCaret}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Day earnings strip ── */}
            <div className={styles.dayStrip}>
              <span className={styles.daySummary}>
                {fill(t.daySummary, { open: openJobs.length, done: doneCount })}
              </span>
              <span className={styles.dayEarn}>
                <span className={styles.dayEarnLabel}>{t.dayEarnings}</span>
                <span className={`${styles.dayEarnValue} money`}>
                  {formatCurrency(dayEarnings)}
                </span>
              </span>
            </div>
          </>
        ) : (
          /* ── All done / nothing assigned ── */
          <div className={styles.emptyState}>
            <CheckCircle size={56} weight="fill" className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>
              {myJobs.length > 0 ? t.allDone : t.noJobs}
            </h2>
            <p className={styles.emptySubtitle}>
              {myJobs.length > 0 ? t.allDoneSubtitle : t.noJobsSubtitle}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
