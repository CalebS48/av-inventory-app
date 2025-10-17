import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import RoomView from './components/RoomView';
import './App.css'; // Import the new CSS file

function App() {
  // State to manage which room is currently selected
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Function to parse floor number from string
  const parseFloor = (floorString) => {
    return parseInt(floorString.match(/\d+/)[0]);
  };
  
  // Handler for when a user clicks a room on the dashboard
  const handleSelectRoom = (location) => {
    const floorNumber = parseFloor(location.floor);
    setSelectedLocation({ ...location, floor: floorNumber });
  };

  // Handler to go back to the dashboard
  const handleGoBack = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AV Inventory Management System 🏢</h1>
      </header>
      <main>
        {selectedLocation ? (
          <RoomView location={selectedLocation} onBack={handleGoBack} />
        ) : (
          <Dashboard onSelectRoom={handleSelectRoom} />
        )}
      </main>
      <footer className="app-footer">
        <p>Built by Caleb Smith | Powered by CodeWeaver</p>
      </footer>
    </div>
  );
}

export default App;
