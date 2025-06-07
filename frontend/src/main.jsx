import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Router } from 'express'
import CheckAuth from './components/check-auth.jsx'
import Tickets from './pages/tickets.jsx'
import TicketDeatilsPage from './pages/ticket.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import Admin from './pages/admin.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Router>
      <Route
      path="/"
      element={
        <CheckAuth protected={true}>
          <Tickets />
        </CheckAuth>
      }
       />

        <Route
      path="/ticket/:id"
      element={
        <CheckAuth protected={true}>
          <TicketDeatilsPage />
        </CheckAuth>
      }
       />

         <Route
      path="/login"
      element={
        <CheckAuth protected={false}>
          <Login />
        </CheckAuth>
      }
       />


         <Route
      path="signup"
      element={
        <CheckAuth protected={false}>
          <Signup />
        </CheckAuth>
      }
       />


         <Route
      path="/admin"
      element={
        <CheckAuth protected={true}>
          <Admin />
        </CheckAuth>
      }
       />

      


    </Router>
    </BrowserRouter>
  </StrictMode>,
)
