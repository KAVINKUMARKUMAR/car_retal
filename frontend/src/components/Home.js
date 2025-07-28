import React from 'react';

function Home() {
  // Stub functions for button clicks - you can replace these with actual navigation or API calls
  const handleHotelBooking = () => {
    alert('Navigate to Hotel Booking page');
    // For example, use React Router navigation here
  };

  const handleCarRental = () => {
    alert('Navigate to Car Rental page');
  };

  const handleFlightBooking = () => {
    alert('Navigate to Flight Booking page');
  };

  const handleLogout = () => {
    alert('Logging out...');
    // Add your logout logic, e.g., clear auth tokens and redirect
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to the Home Page</h1>
      <p>Select an option:</p>
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <button onClick={handleHotelBooking} style={{ margin: '8px 0', padding: '10px' }}>
          Hotel Booking
        </button>
        <button onClick={handleCarRental} style={{ margin: '8px 0', padding: '10px' }}>
          Car Rental
        </button>
        <button onClick={handleFlightBooking} style={{ margin: '8px 0', padding: '10px' }}>
          Flight Booking
        </button>
        <button onClick={handleLogout} style={{ margin: '8px 0', padding: '10px', backgroundColor: 'red', color: 'white' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;
