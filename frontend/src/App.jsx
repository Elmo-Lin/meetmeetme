import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Pricing from './pages/Pricing'
import Safety from './pages/Safety'
import { Signup, Login } from './pages/Auth'
import RequireAuth from './auth/RequireAuth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/member/:id" element={<Profile />} />
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="container empty-page">
      <h1>找不到這個頁面</h1>
      <Link to="/" className="btn btn-primary">回首頁</Link>
    </div>
  )
}
