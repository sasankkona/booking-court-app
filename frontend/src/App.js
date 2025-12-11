import React, { useState } from 'react';
import './App.css';
import { BookingPage } from './pages/BookingPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('booking');

  return (
    <div className="App">
      <nav className="navbar">
        <div className="nav-brand">🏸 Court Booking System</div>
        <div className="nav-links">
          <button
            onClick={() => setCurrentPage('booking')}
            className={`nav-btn ${currentPage === 'booking' ? 'active' : ''}`}
          >
            Book Court
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className={`nav-btn ${currentPage === 'history' ? 'active' : ''}`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setCurrentPage('admin')}
            className={`nav-btn ${currentPage === 'admin' ? 'active' : ''}`}
          >
            Admin
          </button>
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'booking' && <BookingPage />}
        {currentPage === 'history' && <BookingHistoryPage />}
        {currentPage === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default App;
