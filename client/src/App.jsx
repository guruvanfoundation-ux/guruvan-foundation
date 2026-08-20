import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import OurWork from './pages/OurWork.jsx'
import Campaigns from './pages/Campaigns.jsx'
import Resources from './pages/Resources.jsx'
import GetInvolved from './pages/GetInvolved.jsx'
import Donate from './pages/Donate.jsx'
import Contact from './pages/Contact.jsx'
import PagePlaceholder from './pages/PagePlaceholder.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/our-work" element={<OurWork />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/get-involved" element={<GetInvolved />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PagePlaceholder title="Privacy Policy" />} />
        <Route path="/terms" element={<PagePlaceholder title="Terms of Use" />} />
        <Route path="/refund-policy" element={<PagePlaceholder title="Refund Policy" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<PagePlaceholder title="Page Not Found" />} />
      </Routes>
      {!isAdmin && <Footer />}
    </>
  )
}
