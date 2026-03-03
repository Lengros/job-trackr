const encodeSvg = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`

function buildMockPhoto({
  bgStart,
  bgEnd,
  panel,
  shadow,
  accent,
  accentSoft,
  label,
  stamp,
  scene,
}) {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgStart}" />
          <stop offset="100%" stop-color="${bgEnd}" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" fill="url(#bg)" />
      <circle cx="256" cy="58" r="52" fill="${accentSoft}" fill-opacity="0.55" />
      <circle cx="54" cy="256" r="46" fill="#ffffff" fill-opacity="0.1" />
      <rect x="18" y="18" width="284" height="284" rx="28" fill="${panel}" fill-opacity="0.92" />
      <rect x="18" y="238" width="284" height="64" rx="0" fill="${shadow}" fill-opacity="0.14" />
      ${scene({ accent, accentSoft, shadow })}
      <rect x="32" y="34" width="96" height="30" rx="15" fill="#ffffff" fill-opacity="0.2" />
      <text x="80" y="54" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1">${stamp}</text>
      <rect x="32" y="264" width="170" height="26" rx="13" fill="#0f172a" fill-opacity="0.72" />
      <text x="46" y="282" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600">${label}</text>
    </svg>
  `)
}

const scenes = {
  faucetLeak: ({ accent, accentSoft, shadow }) => `
    <rect x="52" y="100" width="216" height="108" rx="24" fill="#eff6ff" />
    <rect x="68" y="120" width="184" height="14" rx="7" fill="#dbeafe" />
    <path d="M116 134h64c22 0 40 18 40 40v14h-26v-12c0-10-8-18-18-18h-60z" fill="${shadow}" fill-opacity="0.75" />
    <rect x="150" y="146" width="22" height="54" rx="11" fill="${accent}" />
    <circle cx="202" cy="195" r="8" fill="${accentSoft}" />
    <path d="M204 194c0 0 13 12 13 22a13 13 0 1 1-26 0c0-10 13-22 13-22Z" fill="#38bdf8" />
    <path d="M182 208c0 0 8 8 8 15a8 8 0 1 1-16 0c0-7 8-15 8-15Z" fill="#7dd3fc" />
    <rect x="96" y="224" width="128" height="12" rx="6" fill="#cbd5e1" />
    <circle cx="248" cy="86" r="22" fill="#ef4444" fill-opacity="0.88" />
    <path d="M248 74v14" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
    <circle cx="248" cy="96" r="3.5" fill="#ffffff" />
  `,
  faucetLeakWide: ({ accent, shadow }) => `
    <rect x="42" y="108" width="236" height="104" rx="24" fill="#f8fafc" />
    <rect x="58" y="132" width="204" height="10" rx="5" fill="#e2e8f0" />
    <path d="M104 140h86c30 0 54 24 54 54v6h-24v-4c0-18-14-32-32-32h-84z" fill="${shadow}" fill-opacity="0.72" />
    <rect x="142" y="150" width="24" height="48" rx="12" fill="${accent}" />
    <path d="M212 202c0 0 14 14 14 24a14 14 0 1 1-28 0c0-10 14-24 14-24Z" fill="#22d3ee" />
    <path d="M238 212c0 0 9 8 9 15a9 9 0 1 1-18 0c0-7 9-15 9-15Z" fill="#67e8f9" />
    <rect x="86" y="224" width="148" height="10" rx="5" fill="#cbd5e1" />
  `,
  bathroomPrep: ({ accent, accentSoft }) => `
    <rect x="52" y="84" width="216" height="148" rx="26" fill="#f8fafc" />
    <rect x="76" y="104" width="62" height="96" rx="14" fill="#e2e8f0" />
    <rect x="160" y="118" width="84" height="68" rx="16" fill="#dbeafe" />
    <circle cx="202" cy="152" r="19" fill="${accent}" fill-opacity="0.24" />
    <rect x="96" y="192" width="128" height="14" rx="7" fill="#cbd5e1" />
    <rect x="70" y="70" width="88" height="22" rx="11" fill="${accentSoft}" fill-opacity="0.92" />
    <rect x="178" y="94" width="44" height="8" rx="4" fill="${accent}" fill-opacity="0.68" />
    <circle cx="235" cy="95" r="5" fill="${accent}" />
  `,
  breakerFault: ({ accent, accentSoft, shadow }) => `
    <rect x="76" y="70" width="168" height="182" rx="18" fill="#1e293b" />
    <rect x="92" y="88" width="136" height="28" rx="8" fill="${shadow}" fill-opacity="0.7" />
    <g fill="#475569">
      <rect x="98" y="132" width="40" height="48" rx="8" />
      <rect x="146" y="132" width="40" height="48" rx="8" />
      <rect x="194" y="132" width="28" height="48" rx="8" />
      <rect x="98" y="188" width="40" height="48" rx="8" />
      <rect x="146" y="188" width="40" height="48" rx="8" />
      <rect x="194" y="188" width="28" height="48" rx="8" />
    </g>
    <rect x="154" y="132" width="24" height="92" rx="8" fill="${accent}" fill-opacity="0.86" />
    <path d="M226 78l22 28-18 8 11 26-36-34 17-8z" fill="#fbbf24" />
    <circle cx="238" cy="214" r="18" fill="${accentSoft}" fill-opacity="0.9" />
    <path d="M238 205v15" stroke="#0f172a" stroke-width="5" stroke-linecap="round" />
    <circle cx="238" cy="225" r="3" fill="#0f172a" />
  `,
  breakerDetail: ({ accent }) => `
    <rect x="64" y="72" width="192" height="176" rx="20" fill="#0f172a" />
    <rect x="82" y="90" width="156" height="20" rx="10" fill="#334155" />
    <g fill="#64748b">
      <rect x="88" y="126" width="58" height="46" rx="8" />
      <rect x="154" y="126" width="58" height="46" rx="8" />
      <rect x="88" y="182" width="58" height="46" rx="8" />
      <rect x="154" y="182" width="58" height="46" rx="8" />
    </g>
    <rect x="168" y="126" width="30" height="102" rx="10" fill="${accent}" />
    <path d="M238 112l18 18-14 7 9 18-30-22 15-7z" fill="#fde047" />
  `,
  drivewayPlan: ({ accent, accentSoft }) => `
    <rect x="40" y="92" width="240" height="148" rx="26" fill="#0f172a" />
    <path d="M70 214c44-34 92-56 152-84" stroke="#334155" stroke-width="30" stroke-linecap="round" />
    <path d="M70 214c44-34 92-56 152-84" stroke="#64748b" stroke-width="4" stroke-dasharray="8 10" stroke-linecap="round" />
    <g fill="${accent}">
      <circle cx="88" cy="206" r="7" />
      <circle cx="126" cy="184" r="7" />
      <circle cx="162" cy="165" r="7" />
      <circle cx="198" cy="144" r="7" />
      <circle cx="234" cy="124" r="7" />
    </g>
    <rect x="56" y="108" width="76" height="38" rx="14" fill="${accentSoft}" fill-opacity="0.9" />
    <rect x="206" y="176" width="40" height="40" rx="14" fill="#1d4ed8" fill-opacity="0.42" />
  `,
  drivewayCables: ({ accent, accentSoft }) => `
    <rect x="46" y="96" width="228" height="140" rx="24" fill="#111827" />
    <path d="M74 212c44-36 88-60 134-86" stroke="#4b5563" stroke-width="26" stroke-linecap="round" />
    <path d="M74 212c44-36 88-60 134-86" stroke="${accent}" stroke-width="6" stroke-dasharray="1 16" stroke-linecap="round" />
    <circle cx="224" cy="132" r="20" fill="${accentSoft}" fill-opacity="0.75" />
    <rect x="60" y="114" width="72" height="30" rx="12" fill="#fef3c7" fill-opacity="0.94" />
  `,
  plumbingDone: ({ accent, accentSoft }) => `
    <rect x="48" y="88" width="224" height="144" rx="26" fill="#f8fafc" />
    <rect x="66" y="108" width="188" height="14" rx="7" fill="#dbeafe" />
    <path d="M110 122h74c28 0 52 24 52 52v12h-26v-10c0-15-12-28-28-28h-72z" fill="#0f172a" fill-opacity="0.7" />
    <rect x="146" y="132" width="24" height="56" rx="12" fill="${accent}" />
    <rect x="90" y="214" width="140" height="10" rx="5" fill="#cbd5e1" />
    <circle cx="232" cy="96" r="24" fill="${accentSoft}" fill-opacity="0.9" />
    <path d="M221 96l8 8 14-18" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  `,
  bathroomDone: ({ accent, accentSoft }) => `
    <rect x="52" y="84" width="216" height="148" rx="26" fill="#ffffff" />
    <rect x="76" y="108" width="60" height="92" rx="14" fill="#e2e8f0" />
    <rect x="158" y="120" width="88" height="66" rx="16" fill="#dbeafe" />
    <circle cx="200" cy="152" r="17" fill="${accent}" fill-opacity="0.24" />
    <rect x="92" y="194" width="136" height="12" rx="6" fill="#cbd5e1" />
    <circle cx="236" cy="94" r="22" fill="${accentSoft}" fill-opacity="0.92" />
    <path d="M226 95l7 7 12-15" fill="none" stroke="#14532d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  `,
  drainDone: ({ accent, accentSoft }) => `
    <rect x="48" y="92" width="224" height="140" rx="24" fill="#f8fafc" />
    <path d="M86 188h148" stroke="#cbd5e1" stroke-width="18" stroke-linecap="round" />
    <path d="M94 188c24-48 60-74 106-78" stroke="${accent}" stroke-width="10" stroke-linecap="round" fill="none" />
    <path d="M186 110c18 8 30 22 38 42" stroke="${accentSoft}" stroke-width="12" stroke-linecap="round" fill="none" />
    <circle cx="232" cy="108" r="22" fill="#dcfce7" />
    <path d="M222 109l7 7 12-15" fill="none" stroke="#166534" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  `,
  electricalDone: ({ accent, accentSoft }) => `
    <rect x="70" y="72" width="180" height="176" rx="20" fill="#1e293b" />
    <rect x="88" y="92" width="144" height="18" rx="9" fill="#334155" />
    <g fill="#64748b">
      <rect x="92" y="126" width="42" height="46" rx="8" />
      <rect x="140" y="126" width="42" height="46" rx="8" />
      <rect x="188" y="126" width="28" height="46" rx="8" />
      <rect x="92" y="182" width="42" height="46" rx="8" />
      <rect x="140" y="182" width="42" height="46" rx="8" />
      <rect x="188" y="182" width="28" height="46" rx="8" />
    </g>
    <rect x="94" y="132" width="122" height="8" rx="4" fill="${accent}" />
    <rect x="94" y="188" width="122" height="8" rx="4" fill="${accentSoft}" />
    <circle cx="232" cy="220" r="18" fill="#dcfce7" />
    <path d="M222 220l7 7 12-15" fill="none" stroke="#166534" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  `,
  lightingDone: ({ accent, accentSoft }) => `
    <rect x="40" y="92" width="240" height="148" rx="26" fill="#0f172a" />
    <path d="M72 214c44-34 92-56 152-84" stroke="#334155" stroke-width="30" stroke-linecap="round" />
    <g fill="${accentSoft}">
      <circle cx="88" cy="206" r="9" />
      <circle cx="126" cy="184" r="9" />
      <circle cx="162" cy="165" r="9" />
      <circle cx="198" cy="144" r="9" />
      <circle cx="234" cy="124" r="9" />
    </g>
    <g fill="${accent}" fill-opacity="0.45">
      <circle cx="88" cy="206" r="22" />
      <circle cx="126" cy="184" r="22" />
      <circle cx="162" cy="165" r="22" />
      <circle cx="198" cy="144" r="22" />
      <circle cx="234" cy="124" r="22" />
    </g>
    <rect x="58" y="108" width="86" height="30" rx="12" fill="#dcfce7" fill-opacity="0.92" />
  `,
  constructionFrame: ({ accent, accentSoft }) => `
    <rect x="44" y="80" width="232" height="160" rx="26" fill="#fafaf9" />
    <rect x="78" y="102" width="12" height="106" rx="6" fill="#d97706" />
    <rect x="134" y="102" width="12" height="106" rx="6" fill="#d97706" />
    <rect x="190" y="102" width="12" height="106" rx="6" fill="#d97706" />
    <rect x="70" y="108" width="142" height="10" rx="5" fill="#b45309" />
    <rect x="70" y="192" width="142" height="10" rx="5" fill="#b45309" />
    <rect x="224" y="112" width="22" height="88" rx="8" fill="${accent}" />
    <circle cx="236" cy="88" r="20" fill="${accentSoft}" fill-opacity="0.88" />
  `,
  constructionFinish: ({ accent, accentSoft }) => `
    <rect x="42" y="82" width="236" height="156" rx="26" fill="#fafaf9" />
    <rect x="66" y="104" width="188" height="112" rx="18" fill="#e7e5e4" />
    <rect x="82" y="120" width="84" height="78" rx="12" fill="#d6d3d1" />
    <rect x="178" y="120" width="54" height="18" rx="9" fill="${accent}" fill-opacity="0.78" />
    <rect x="178" y="148" width="62" height="12" rx="6" fill="#a8a29e" />
    <rect x="178" y="170" width="48" height="12" rx="6" fill="#a8a29e" />
    <circle cx="238" cy="92" r="22" fill="${accentSoft}" fill-opacity="0.9" />
    <path d="M228 92l7 7 12-15" fill="none" stroke="#14532d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  `,
  deckRepair: ({ accent, accentSoft }) => `
    <rect x="34" y="98" width="252" height="136" rx="24" fill="#f8fafc" />
    <path d="M66 202h188" stroke="#b45309" stroke-width="14" stroke-linecap="round" />
    <path d="M66 176h188" stroke="#d97706" stroke-width="14" stroke-linecap="round" />
    <path d="M86 118l24 86" stroke="#92400e" stroke-width="12" stroke-linecap="round" />
    <path d="M234 118l-24 86" stroke="#92400e" stroke-width="12" stroke-linecap="round" />
    <circle cx="236" cy="92" r="22" fill="${accentSoft}" fill-opacity="0.9" />
    <rect x="54" y="114" width="82" height="24" rx="12" fill="${accent}" fill-opacity="0.18" />
  `,
}

const mockPhotoPool = {
  problemLeakClose: buildMockPhoto({
    bgStart: '#0f766e',
    bgEnd: '#1d4ed8',
    panel: '#ecfeff',
    shadow: '#0f172a',
    accent: '#0f766e',
    accentSoft: '#67e8f9',
    label: 'Kitchen leak',
    stamp: 'BEFORE',
    scene: scenes.faucetLeak,
  }),
  problemLeakWide: buildMockPhoto({
    bgStart: '#0f172a',
    bgEnd: '#0284c7',
    panel: '#eff6ff',
    shadow: '#1e293b',
    accent: '#2563eb',
    accentSoft: '#7dd3fc',
    label: 'Under sink',
    stamp: 'BEFORE',
    scene: scenes.faucetLeakWide,
  }),
  problemBathInstall: buildMockPhoto({
    bgStart: '#0f766e',
    bgEnd: '#0ea5e9',
    panel: '#f8fafc',
    shadow: '#0f172a',
    accent: '#0ea5e9',
    accentSoft: '#bae6fd',
    label: 'Bath prep',
    stamp: 'BEFORE',
    scene: scenes.bathroomPrep,
  }),
  problemBreaker: buildMockPhoto({
    bgStart: '#0f172a',
    bgEnd: '#334155',
    panel: '#111827',
    shadow: '#020617',
    accent: '#ef4444',
    accentSoft: '#fca5a5',
    label: 'Breaker panel',
    stamp: 'BEFORE',
    scene: scenes.breakerFault,
  }),
  problemBreakerClose: buildMockPhoto({
    bgStart: '#111827',
    bgEnd: '#1e293b',
    panel: '#0f172a',
    shadow: '#020617',
    accent: '#f59e0b',
    accentSoft: '#fde68a',
    label: 'Fault detail',
    stamp: 'BEFORE',
    scene: scenes.breakerDetail,
  }),
  problemDriveway: buildMockPhoto({
    bgStart: '#14532d',
    bgEnd: '#0f766e',
    panel: '#052e16',
    shadow: '#020617',
    accent: '#facc15',
    accentSoft: '#fef08a',
    label: 'Driveway plan',
    stamp: 'BEFORE',
    scene: scenes.drivewayPlan,
  }),
  problemCables: buildMockPhoto({
    bgStart: '#1f2937',
    bgEnd: '#0f766e',
    panel: '#111827',
    shadow: '#020617',
    accent: '#eab308',
    accentSoft: '#fde68a',
    label: 'Cable route',
    stamp: 'BEFORE',
    scene: scenes.drivewayCables,
  }),
  resultPlumbing: buildMockPhoto({
    bgStart: '#0ea5e9',
    bgEnd: '#2563eb',
    panel: '#f8fafc',
    shadow: '#0f172a',
    accent: '#1d4ed8',
    accentSoft: '#86efac',
    label: 'Leak fixed',
    stamp: 'DONE',
    scene: scenes.plumbingDone,
  }),
  resultBathroom: buildMockPhoto({
    bgStart: '#0284c7',
    bgEnd: '#0f766e',
    panel: '#ffffff',
    shadow: '#0f172a',
    accent: '#0ea5e9',
    accentSoft: '#86efac',
    label: 'Fixtures set',
    stamp: 'DONE',
    scene: scenes.bathroomDone,
  }),
  resultDrain: buildMockPhoto({
    bgStart: '#0f766e',
    bgEnd: '#1d4ed8',
    panel: '#f8fafc',
    shadow: '#0f172a',
    accent: '#0ea5e9',
    accentSoft: '#67e8f9',
    label: 'Drain clear',
    stamp: 'DONE',
    scene: scenes.drainDone,
  }),
  resultElectrical: buildMockPhoto({
    bgStart: '#1e293b',
    bgEnd: '#0f172a',
    panel: '#111827',
    shadow: '#020617',
    accent: '#22c55e',
    accentSoft: '#86efac',
    label: 'Panel online',
    stamp: 'DONE',
    scene: scenes.electricalDone,
  }),
  resultLighting: buildMockPhoto({
    bgStart: '#0f172a',
    bgEnd: '#14532d',
    panel: '#111827',
    shadow: '#020617',
    accent: '#facc15',
    accentSoft: '#fef08a',
    label: 'Lights on',
    stamp: 'DONE',
    scene: scenes.lightingDone,
  }),
  resultConstructionFrame: buildMockPhoto({
    bgStart: '#92400e',
    bgEnd: '#d97706',
    panel: '#fffbeb',
    shadow: '#78350f',
    accent: '#fb923c',
    accentSoft: '#fdba74',
    label: 'Framing up',
    stamp: 'DONE',
    scene: scenes.constructionFrame,
  }),
  resultConstructionFinish: buildMockPhoto({
    bgStart: '#57534e',
    bgEnd: '#a8a29e',
    panel: '#fafaf9',
    shadow: '#44403c',
    accent: '#22c55e',
    accentSoft: '#86efac',
    label: 'Partition set',
    stamp: 'DONE',
    scene: scenes.constructionFinish,
  }),
  resultDeck: buildMockPhoto({
    bgStart: '#78350f',
    bgEnd: '#b45309',
    panel: '#fffbeb',
    shadow: '#451a03',
    accent: '#22c55e',
    accentSoft: '#86efac',
    label: 'Deck restored',
    stamp: 'DONE',
    scene: scenes.deckRepair,
  }),
}

const seededProblemPhotosByJob = {
  1: [mockPhotoPool.problemLeakClose, mockPhotoPool.problemLeakWide, mockPhotoPool.problemLeakClose],
  2: [mockPhotoPool.problemBathInstall, mockPhotoPool.problemBathInstall],
  4: [
    mockPhotoPool.problemBreaker,
    mockPhotoPool.problemBreakerClose,
    mockPhotoPool.problemBreaker,
    mockPhotoPool.problemBreakerClose,
  ],
  5: [mockPhotoPool.problemDriveway, mockPhotoPool.problemCables],
}

const seededResultPhotosByJob = {
  1: [mockPhotoPool.resultPlumbing, mockPhotoPool.resultBathroom],
  2: [mockPhotoPool.resultBathroom, mockPhotoPool.resultPlumbing],
  3: [mockPhotoPool.resultDrain, mockPhotoPool.resultPlumbing],
  4: [mockPhotoPool.resultElectrical],
  5: [mockPhotoPool.resultLighting, mockPhotoPool.resultElectrical],
  6: [mockPhotoPool.resultElectrical],
  7: [
    mockPhotoPool.resultConstructionFrame,
    mockPhotoPool.resultConstructionFinish,
    mockPhotoPool.resultConstructionFinish,
  ],
  8: [mockPhotoPool.resultDeck, mockPhotoPool.resultConstructionFinish],
}

const resultPhotosByWorkType = {
  Plumbing: [mockPhotoPool.resultPlumbing, mockPhotoPool.resultBathroom, mockPhotoPool.resultDrain],
  Electrical: [mockPhotoPool.resultElectrical, mockPhotoPool.resultLighting],
  Construction: [
    mockPhotoPool.resultConstructionFrame,
    mockPhotoPool.resultConstructionFinish,
    mockPhotoPool.resultDeck,
  ],
  default: [mockPhotoPool.resultPlumbing, mockPhotoPool.resultElectrical, mockPhotoPool.resultConstructionFinish],
}

function pickPhoto(photos, index = 0) {
  if (!photos || photos.length === 0) {
    return ''
  }

  return photos[index % photos.length]
}

export function getSeededProblemPhoto(jobId, index = 0) {
  return pickPhoto(seededProblemPhotosByJob[jobId], index)
}

export function getSeededResultPhoto(jobId, index = 0) {
  return pickPhoto(seededResultPhotosByJob[jobId], index)
}

export function getMockUploadPhoto(jobId, jobs, existingCount = 0) {
  const seededPhoto = getSeededResultPhoto(jobId, existingCount)
  if (seededPhoto) {
    return seededPhoto
  }

  const job = jobs.find((item) => item.id === jobId)
  const fallbackPool = resultPhotosByWorkType[job?.workType] || resultPhotosByWorkType.default
  return pickPhoto(fallbackPool, existingCount)
}
