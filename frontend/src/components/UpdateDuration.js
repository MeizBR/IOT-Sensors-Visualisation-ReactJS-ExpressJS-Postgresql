import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const WS_URL = 'ws://localhost:5003';

const UpdateDuration = ({ value }) => {
  const [updateXAgo, setUpdateXAgo] = useState("");
  const [v, setV] = useState(value);
  const [ut, setUT] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = io(WS_URL);

    socket.emit('sensorId', v);

    socket.on('updatedXAgo', (data) => {
      // console.log(typeof data);
      setUT(data);
      setIsLoading(false);
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
  }, [v]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/viewUpdateDuration/${value}`);
      
      const { updatedXAgo } = response.data;
      setUpdateXAgo(updatedXAgo);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <h6>Loading...</h6>;
  }

  return <h6 style={{color: "green"}}>{ut}</h6>;
};

export default UpdateDuration;
