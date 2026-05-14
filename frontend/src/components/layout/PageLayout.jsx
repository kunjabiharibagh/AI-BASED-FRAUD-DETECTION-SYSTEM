import Sidebar from './Sidebar'
import Navbar from './Navbar'

// Wraps every protected page
// with sidebar + navbar + content area
function PageLayout({ title, subtitle, children }) {
  return (
    <div style={styles.container}>

      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main content - right of sidebar */}
      <div style={styles.main}>

        {/* Top navbar */}
        <Navbar title={title} subtitle={subtitle} />

        {/* Page content */}
        <div style={styles.content}>
          {children}
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0f',
    fontFamily: "'Segoe UI', sans-serif"
  },
  main: {
    flex: 1,
    marginLeft: '240px', // Same as sidebar width
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  content: {
    flex: 1,
    padding: '24px 28px',
    overflowY: 'auto'
  }
}

export default PageLayout