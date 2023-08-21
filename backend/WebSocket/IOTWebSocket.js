// express
const express = require('express');
const app = express();

// cors
const cors = require('cors');
app.use(cors());

// bodyParser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// use json
app.use(express.json());

const WebSocket = require('ws');

const socket = new WebSocket("wss://s9613.lon1.piesocket.com/v3/1?api_key=mskwwA1WHa9KqqBNgLRsG9VQc9WF3ENCbLQb3j9c&notify_self=1");

// connect to the postresql database sensors_to_regions_measures
const pool = require("../db");

const { io } = require('./DB_Back_FrontWebSocket.js');

function add_to_db(sensorId, current_value, last_update) {
  // update the current_value (linked to the last_update)
  const query = 'UPDATE value SET current_value = $1, last_update = $2 WHERE sensor_id = $3';
  const values = [current_value, last_update, sensorId];
  console.log(last_update);
  pool.query(query, values)
    .then(() => {
      console.log('Measure updated successfully');
    })
    .catch((error) => {
      console.error('Error occurred during measure update:', error);
    });
}



// Listen for the 'open' event to know when the connection is established
socket.on('open', () => {
  console.log('Connected to the WebSocket channel between the iot sensor and the express backend server\n');
});

// Listen for the 'message' event to receive data from the server
socket.on('message', (data) => {
  // Convert the binary data to a string
  const messageString = data.toString('utf8');

  try {
    // Parse the received data back into a JavaScript object
    const message = JSON.parse(messageString);
    if (message &&
        typeof message.sensor_id === 'number' &&
        typeof message.current_value === 'number' &&
        typeof message.last_update === 'string'
    ) {
      console.log('Valid message');
      console.log(message);
      add_to_db(message.sensor_id,message.current_value, message.last_update);
      console.log("successfull operation");
    } else {
      console.log('Invalid message');
    }
  } catch (error) {
    console.log('Invalid message');
    console.error('Error parsing JSON data:', error);
  }
});

// Listen for the 'close' event to know when the connection is closed
socket.on('close', (code, reason) => {
  console.log(`Connection closed with code ${code}: ${reason}`);
});

// Listen for the 'error' event to handle any errors that occur during the connection
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

module.exports = {
  socket,
  add_to_db,
}