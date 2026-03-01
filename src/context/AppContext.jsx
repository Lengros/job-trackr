import { createContext, useContext, useReducer } from 'react'
import { masters, jobs as initialJobs, photos as initialPhotos, expenses as initialExpenses } from '../data/fixtures'

const AppContext = createContext(null)

const initialState = {
  masters,
  selectedMasterId: null,
  jobs: initialJobs,
  photos: initialPhotos,
  expenses: initialExpenses,
  isOnline: true,
  nextPhotoId: initialPhotos.length + 1,
  nextExpenseId: initialExpenses.length + 1,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SELECT_MASTER':
      return { ...state, selectedMasterId: action.payload }

    case 'UPDATE_JOB_STATUS': {
      const { jobId, newStatus } = action.payload
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: newStatus,
                syncStatus: state.isOnline ? job.syncStatus : 'pending',
              }
            : job
        ),
      }
    }

    case 'ADD_PHOTO': {
      const newPhoto = {
        id: state.nextPhotoId,
        jobId: action.payload.jobId,
        thumbnailUrl: '',
        timestamp: new Date().toISOString(),
      }
      return {
        ...state,
        photos: [...state.photos, newPhoto],
        nextPhotoId: state.nextPhotoId + 1,
      }
    }

    case 'DELETE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter((p) => p.id !== action.payload.photoId),
      }

    case 'ADD_EXPENSE': {
      const newExpense = {
        id: state.nextExpenseId,
        jobId: action.payload.jobId,
        name: action.payload.name,
        quantity: action.payload.quantity,
        unitPrice: action.payload.unitPrice,
      }
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
        nextExpenseId: state.nextExpenseId + 1,
      }
    }

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((exp) =>
          exp.id === action.payload.id ? { ...exp, ...action.payload } : exp
        ),
      }

    case 'UPDATE_JOB_NOTES': {
      const { jobId: noteJobId, notes } = action.payload
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === noteJobId ? { ...job, notes } : job
        ),
      }
    }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(
          (exp) => exp.id !== action.payload.expenseId
        ),
      }

    case 'TOGGLE_NETWORK': {
      const goingOnline = !state.isOnline
      if (goingOnline) {
        // First transition pending items to 'syncing' (intermediate animated state)
        return {
          ...state,
          isOnline: true,
          isSyncing: true,
          jobs: state.jobs.map((job) =>
            job.syncStatus === 'pending'
              ? { ...job, syncStatus: 'syncing' }
              : job
          ),
        }
      }
      return { ...state, isOnline: false }
    }

    case 'SYNC_COMPLETE': {
      // Transition syncing items to synced after animation
      return {
        ...state,
        isSyncing: false,
        jobs: state.jobs.map((job) =>
          job.syncStatus === 'syncing'
            ? { ...job, syncStatus: 'synced' }
            : job
        ),
      }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
