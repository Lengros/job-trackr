import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import MasterSelection from './screens/MasterSelection'
import JobList from './screens/JobList'
import JobDetail from './screens/JobDetail'
import Photos from './screens/Photos'
import Expenses from './screens/Expenses'
import JobSummary from './screens/JobSummary'
import SyncStatus from './screens/SyncStatus'
import Layout from './components/Layout'
import Toast from './components/Toast'

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<MasterSelection />} />
            <Route element={<Layout />}>
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:jobId" element={<JobDetail />} />
              <Route path="/jobs/:jobId/photos" element={<Photos />} />
              <Route path="/jobs/:jobId/expenses" element={<Expenses />} />
              <Route path="/jobs/:jobId/summary" element={<JobSummary />} />
              <Route path="/sync" element={<SyncStatus />} />
            </Route>
          </Routes>
          <Toast />
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}

export default App
