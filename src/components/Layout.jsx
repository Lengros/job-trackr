import { Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from './Header'
import OfflineBanner from './OfflineBanner'
import BottomTabBar from './BottomTabBar'
import styles from '../styles/Layout.module.css'

export default function Layout() {
  const { state } = useApp()
  const isOffline = !state.isOnline

  return (
    <div className={styles.layout}>
      <Header />
      <OfflineBanner />
      <main className={`${styles.content} ${isOffline ? styles.contentWithBanner : ''}`}>
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
