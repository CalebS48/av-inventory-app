import React from 'react';

// This defines the structure of your building's rooms
const locations = {
  "1st Floor": ["Pro Sto (Production Storage)", "Atrium Closet", "TV Cart Storage"],
  "2nd Floor": ["Pegasus Penthouse"],
  "3rd Floor": ["Third Floor Storage", "Charge on Chamber"],
  "4th Floor": ["4th Floor Storage", "Farith's office"]
};

function Dashboard({ onSelectRoom }) {
  return (
    <div className="dashboard">
      <h2>Select an AV Room</h2>
      {Object.entries(locations).map(([floor, rooms]) => (
        <div key={floor} className="floor-section">
          <h3>{floor}</h3>
          <div className="room-list">
            {rooms.map(room => (
              <button key={room} className="room-button" onClick={() => onSelectRoom({ floor, room })}>
                {room}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
