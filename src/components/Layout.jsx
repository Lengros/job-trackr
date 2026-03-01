import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomTabBar from './BottomTabBar'
import styles from '../styles/Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
