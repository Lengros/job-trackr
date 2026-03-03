/**
 * Fixture data for JobTrackr prototype.
 * All data is in-memory — no backend or database.
 */

import { getSeededProblemPhoto, getSeededResultPhoto } from './photoMocks'

function withSeededResultPhoto() {
  const photoIndexes = new Map()

  return (photo) => {
    const currentIndex = photoIndexes.get(photo.jobId) || 0
    photoIndexes.set(photo.jobId, currentIndex + 1)

    return {
      ...photo,
      thumbnailUrl: getSeededResultPhoto(photo.jobId, currentIndex),
    }
  }
}

function withSeededProblemPhoto() {
  const photoIndexes = new Map()

  return (photo) => {
    const currentIndex = photoIndexes.get(photo.jobId) || 0
    photoIndexes.set(photo.jobId, currentIndex + 1)
    const seededPhoto = getSeededProblemPhoto(photo.jobId, currentIndex)

    return {
      ...photo,
      remoteUrl: seededPhoto,
      thumbnailUrl: seededPhoto,
    }
  }
}

export const masters = [
  {
    id: 1,
    name: 'Ivan',
    specialization: 'Plumber',
    avatarColor: '#2563EB',
  },
  {
    id: 2,
    name: 'Mike',
    specialization: 'Electrician',
    avatarColor: '#F59E0B',
  },
  {
    id: 3,
    name: 'James',
    specialization: 'General Builder',
    avatarColor: '#16A34A',
  },
  {
    id: 4,
    name: 'Alex',
    specialization: 'Plumber',
    avatarColor: '#8B5CF6',
  },
]

export const jobs = [
  {
    id: 1,
    number: 'JOB-001',
    address: '42 Oak Street, Apt 3B',
    contactName: 'Sarah Johnson',
    contactPhone: '+1 (555) 123-4567',
    workType: 'Plumbing',
    workDescription: 'Fix leaking kitchen faucet and replace worn-out washers. Check under-sink pipes for corrosion.',
    comments: 'Tenant reports leak has been worsening over the past week. Access through front door — buzzer #3B.',
    workCost: 150.00,
    status: 'new',
    syncStatus: 'synced',
    assignedMasterId: 1,
    createdDate: '2026-02-25T09:00:00Z',
  },
  {
    id: 2,
    number: 'JOB-002',
    address: '118 Maple Avenue',
    contactName: 'David Chen',
    contactPhone: '+1 (555) 234-5678',
    workType: 'Plumbing',
    workDescription: 'Install new bathroom fixtures: toilet, sink, and shower head. Old fixtures to be removed and disposed of.',
    comments: 'Customer purchased fixtures already — they are in the garage. Parking available in driveway.',
    workCost: 320.00,
    status: 'in_progress',
    syncStatus: 'synced',
    assignedMasterId: 1,
    createdDate: '2026-02-22T14:30:00Z',
  },
  {
    id: 3,
    number: 'JOB-003',
    address: '7 Pine Road, Unit 12',
    contactName: 'Maria Garcia',
    contactPhone: '+1 (555) 345-6789',
    workType: 'Plumbing',
    workDescription: 'Unclog main drain line. Tenant reports slow drainage in all sinks and tubs.',
    comments: 'Building manager will provide access. Call 30 min before arrival.',
    workCost: 200.00,
    status: 'completed',
    syncStatus: 'synced',
    assignedMasterId: 1,
    createdDate: '2026-02-18T08:00:00Z',
  },
  {
    id: 4,
    number: 'JOB-004',
    address: '255 Broadway, Floor 2',
    contactName: 'Tom Wilson',
    contactPhone: '+1 (555) 456-7890',
    workType: 'Electrical',
    workDescription: 'Replace faulty circuit breaker panel. Upgrade from 100A to 200A service.',
    comments: 'Power will need to be shut off for 2-3 hours. Notify tenants in advance.',
    workCost: 450.00,
    status: 'new',
    syncStatus: 'pending',
    assignedMasterId: 2,
    createdDate: '2026-02-26T10:00:00Z',
  },
  {
    id: 5,
    number: 'JOB-005',
    address: '89 Cedar Lane',
    contactName: 'Emma Brown',
    contactPhone: '+1 (555) 567-8901',
    workType: 'Electrical',
    workDescription: 'Install outdoor LED lighting along driveway and garden path. Run weatherproof wiring.',
    comments: 'Customer wants warm white (3000K) lights. Fixtures are ordered — check with homeowner on delivery.',
    workCost: 280.00,
    status: 'in_progress',
    syncStatus: 'error',
    assignedMasterId: 2,
    createdDate: '2026-02-20T11:00:00Z',
  },
  {
    id: 6,
    number: 'JOB-006',
    address: '33 Elm Street',
    contactName: 'Robert Taylor',
    contactPhone: '+1 (555) 678-9012',
    workType: 'Electrical',
    workDescription: 'Troubleshoot intermittent power outages in living room and bedroom. Check wiring and outlets.',
    comments: 'Issue happens mostly in evenings. May be overloaded circuits.',
    workCost: 175.00,
    status: 'completed',
    syncStatus: 'synced',
    assignedMasterId: 2,
    createdDate: '2026-02-15T13:00:00Z',
  },
  {
    id: 7,
    number: 'JOB-007',
    address: '500 Industrial Blvd',
    contactName: 'Lisa Martinez',
    contactPhone: '+1 (555) 789-0123',
    workType: 'Construction',
    workDescription: 'Build partition wall in open-plan office to create meeting room. Drywall, framing, and paint.',
    comments: 'Work can only be done after 6 PM when office is closed. Security will provide access.',
    workCost: 600.00,
    status: 'in_progress',
    syncStatus: 'conflict',
    assignedMasterId: 3,
    createdDate: '2026-02-19T16:00:00Z',
  },
  {
    id: 8,
    number: 'JOB-008',
    address: '12 Harbor View Drive',
    contactName: 'Kevin O\'Brien',
    contactPhone: '+1 (555) 890-1234',
    workType: 'Construction',
    workDescription: 'Repair deck railing and replace damaged boards. Sand and re-stain entire deck surface.',
    comments: 'Deck faces the backyard — access via side gate (code: 1234). Dog in yard, please call ahead.',
    workCost: 350.00,
    status: 'new',
    syncStatus: 'synced',
    assignedMasterId: 3,
    createdDate: '2026-02-27T07:30:00Z',
  },
]

export const photos = [
  { id: 1, jobId: 2, thumbnailUrl: '', timestamp: '2026-02-22T15:00:00Z' },
  { id: 2, jobId: 2, thumbnailUrl: '', timestamp: '2026-02-22T15:05:00Z' },
  { id: 3, jobId: 3, thumbnailUrl: '', timestamp: '2026-02-18T10:00:00Z' },
  { id: 4, jobId: 5, thumbnailUrl: '', timestamp: '2026-02-21T09:30:00Z' },
  { id: 5, jobId: 7, thumbnailUrl: '', timestamp: '2026-02-20T18:30:00Z' },
  { id: 6, jobId: 7, thumbnailUrl: '', timestamp: '2026-02-20T19:00:00Z' },
  { id: 7, jobId: 7, thumbnailUrl: '', timestamp: '2026-02-21T18:00:00Z' },
].map(withSeededResultPhoto())

/**
 * Problem photos — attached by dispatcher/client to illustrate the problem
 * before the technician arrives. Read-only for the master.
 */
export const problemPhotos = [
  // JOB-001 (id:1) — leaking kitchen faucet: 3 photos from client
  { id: 1, jobId: 1, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-24T18:00:00Z', uploadedBy: 'client' },
  { id: 2, jobId: 1, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-24T18:02:00Z', uploadedBy: 'client' },
  { id: 3, jobId: 1, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-24T18:05:00Z', uploadedBy: 'client' },
  // JOB-002 (id:2) — bathroom fixture install: 2 photos from dispatcher
  { id: 4, jobId: 2, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-21T10:00:00Z', uploadedBy: 'dispatcher' },
  { id: 5, jobId: 2, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-21T10:03:00Z', uploadedBy: 'dispatcher' },
  // JOB-004 (id:4) — circuit breaker panel: 4 photos from client (tests horizontal scroll)
  { id: 6, jobId: 4, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-25T14:00:00Z', uploadedBy: 'client' },
  { id: 7, jobId: 4, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-25T14:01:00Z', uploadedBy: 'client' },
  { id: 8, jobId: 4, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-25T14:02:00Z', uploadedBy: 'dispatcher' },
  { id: 9, jobId: 4, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-25T14:03:00Z', uploadedBy: 'client' },
  // JOB-005 (id:5) — LED lighting: 2 photos from dispatcher
  { id: 10, jobId: 5, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-19T09:00:00Z', uploadedBy: 'dispatcher' },
  { id: 11, jobId: 5, remoteUrl: '', thumbnailUrl: '', createdAt: '2026-02-19T09:05:00Z', uploadedBy: 'dispatcher' },
  // JOB-003 (id:3) — no problem photos (0 photos)
  // JOB-006 (id:6) — no problem photos (0 photos)
  // JOB-007 (id:7) — no problem photos (0 photos)
  // JOB-008 (id:8) — no problem photos (0 photos)
].map(withSeededProblemPhoto())

export const expenses = [
  { id: 1, jobId: 2, name: 'Toilet', quantity: 1, unitPrice: 189.99 },
  { id: 2, jobId: 2, name: 'Sink faucet', quantity: 1, unitPrice: 79.50 },
  { id: 3, jobId: 2, name: 'Teflon tape', quantity: 3, unitPrice: 2.99 },
  { id: 4, jobId: 3, name: 'Drain snake', quantity: 1, unitPrice: 45.00 },
  { id: 5, jobId: 3, name: 'Pipe cleaner solution', quantity: 2, unitPrice: 12.50 },
  { id: 6, jobId: 5, name: 'LED pathway lights', quantity: 8, unitPrice: 24.99 },
  { id: 7, jobId: 5, name: 'Weatherproof cable (50ft)', quantity: 2, unitPrice: 35.00 },
  { id: 8, jobId: 7, name: 'Drywall sheets', quantity: 6, unitPrice: 14.50 },
  { id: 9, jobId: 7, name: 'Wood studs 2x4', quantity: 12, unitPrice: 5.75 },
  { id: 10, jobId: 7, name: 'Joint compound', quantity: 2, unitPrice: 11.99 },
  { id: 11, jobId: 7, name: 'Paint (2 gal)', quantity: 2, unitPrice: 32.00 },
]
