import { React, useState, useEffect } from 'react';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import"./App.css";
import StickFigure from './components/StickFigure';
import Legend from './components/Legend';
import UpdateDuration from './components/UpdateDuration';
import { io } from 'socket.io-client';

const WS_URL = 'ws://localhost:5003';


function App() {

  const [results, setResults] = useState([]);
  const [selectedMeasure, setSelectedMeasure] = useState("Temperature");

  const [realTimeMarkers, setRealTimeMarkers] = useState([]);

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io(WS_URL);

    socket.emit('selectedMeasure', selectedMeasure);

    socket.on('update', (data) => {
      const uniqueData = data.filter((item, index, self) =>
      index === self.findIndex((t) => t.sensor_id === item.sensor_id)
      );

      // Update the realTimeMarkers state with the new data using the setRealTimeMarkers function
      setRealTimeMarkers(uniqueData);
    });

    // Event listener for 'response' event from the server
    socket.on('response', (data) => {
      console.log('Server says:', data);
    });

    // Event listener for 'message' event from the server (if needed)
    socket.on('message', (data) => {
      console.log('Server says:', data);
    });

    // Clean up the WebSocket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [selectedMeasure]);

  const fetchData = async (measure) => {
    try {
      const response = await axios.get(`http://localhost:5000/sensors/${measure}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchData(selectedMeasure);
  }, [selectedMeasure]);

  const handleButtonClick = (value) => {
    setSelectedMeasure(value);
  };

  // Combine the markers from both sources (REST API and WebSocket) into a single array
  const combinedMarkers = [...results, ...realTimeMarkers];

  

  return (
    
    <MapContainer className='map-container' center={[35.8258 , 10.6412]} zoom={15}>

      <TileLayer
          
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Legend />
      <button
        onClick={() => handleButtonClick("Humidity")}
        className="custom-map-button"
        value="Humidity"
        style={{
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          zIndex: 1000,
          width:"100px",
          height:"35px",
          border: "2px solid gray",
          color: selectedMeasure === 'Humidity' ? 'white' : 'black',
          textAlign: "center",
          borderRadius: "8px",
          fontSize: "17px",
          fontWeight: "bold",
          marginRight: "15px",
          backgroundColor: selectedMeasure === 'Humidity' ? 'gray' : 'lightgray',
        }}
      >
       Humidity
      </button>
      <button
        onClick={() => handleButtonClick("Temperature")}
        className="custom-map-button"
        style={{
          position: 'absolute', 
          top: '10px', 
          right: '120px',
          zIndex: 1000,
          width:"100px",
          height:"35px",
          border: "2px solid gray",
          color: selectedMeasure === 'Temperature' ? 'white' : 'black',
          textAlign: "center",
          borderRadius: "8px",
          fontSize: "17px",
          fontWeight: "bold",
          marginRight: "15px",
          backgroundColor: selectedMeasure === 'Temperature' ? 'gray' : 'lightgray',
        }}
      >
        Temperature
      </button>
      <button
        onClick={() => handleButtonClick("CO2")}
        className="custom-map-button"
        style={{
          position: 'absolute', 
          top: '10px', 
          right: '230px',
          zIndex: 1000,
          width:"100px",
          height:"35px",
          border: "2px solid gray",
          color: selectedMeasure === 'CO2' ? 'white' : 'black',
          textAlign: "center",
          borderRadius: "8px",
          fontSize: "17px",
          fontWeight: "bold",
          marginRight: "15px",
          backgroundColor: selectedMeasure === 'CO2' ? 'gray' : 'lightgray',
        }}
      >
        CO2
      </button>

      <button
        onClick={() => handleButtonClick("Pressure")}
        className="custom-map-button"
        style={{
          position: 'absolute', 
          top: '10px', 
          right: '340px',
          zIndex: 1000,
          width:"100px",
          height:"35px",
          border: "2px solid gray",
          color: selectedMeasure === 'Pressure' ? 'white' : 'black',
          textAlign: "center",
          borderRadius: "8px",
          fontSize: "17px",
          fontWeight: "bold",
          marginRight: "15px",
          backgroundColor: selectedMeasure === 'Pressure' ? 'gray' : 'lightgray',
        }}
      >
        Pressure
      </button>

    {combinedMarkers.map((marker, index) => (
        <div key={index}>
          <Marker position={[parseFloat(marker.latitude), parseFloat(marker.longitude)]} icon={L.divIcon({
            html: ReactDOMServer.renderToString(<StickFigure measureType={marker.measure_type} value={parseFloat(marker.current_value).toFixed(2)} />),
            iconSize: [70, 150],
            iconAnchor: [35, 75],
            className: 'custom-icon',
          })}>
            <Tooltip>
              <div id='measure-details'>
                <h6><span>Sensor Id:</span> {marker.sensor_id}</h6>
                <h6>
                  <span>Coordinates:</span>
                  <ul>
                    <li><span>Latitude:</span> {marker.latitude}</li>
                    <li><span>Longitude:</span> {marker.longitude}</li>
                  </ul>
                </h6>
                <h6><span>Measure Type:</span> {marker.measure_type}</h6>
                <UpdateDuration value={parseInt(marker.sensor_id)} />
              </div>
            </Tooltip>
          </Marker>
        </div>
      ))}

    </MapContainer>

  );
}

export default App;