import { Navigate } from 'react-router-dom'

function Home() {
  return <Navigate to="/chat" replace />
}

export default Home
