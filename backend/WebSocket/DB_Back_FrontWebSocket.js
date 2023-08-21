const { Server } = require("socket.io");

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

// connect to the postresql database sensors_to_regions_measures
const pool = require("../db");

// use moment
const moment = require('moment-timezone');

const io = new Server({ cors: { origin: '*' } });

io.listen(5003);

async function filter_measure_type(temp) {

  const query = 'select s.latitude, s.longitude, s.sensor_id, m.measure_type, v.current_value from sensor s, measure m, value v where s.measure_type = m.measure_type and s.sensor_id = v.sensor_id and m.measure_type = $1';
  
  const values = [temp];
  const result = await pool.query(query, values);

  return result.rows;
}

async function updated_x_ago(sId) {
  const sensorId = sId;
  const query = "SELECT last_update FROM value WHERE sensor_id = $1";
  const values = [sensorId];
  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    return { updatedXAgo: "No data found for the given sensorId" };
  }

  const lastUpdate = moment.utc(result.rows[0].last_update).local();
  const currentDate = moment().tz('Africa/Tunis');
  
  const duration = moment.duration(currentDate.diff(lastUpdate));

  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const updatedXAgo = "Updated " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds ago";

  let res = {
    currentDate: currentDate.format(),
    lastUpdate: lastUpdate.format(),
    updatedXAgo: updatedXAgo,
  }

  return updatedXAgo;
}

// Create WebSocket server
io.on("connection", (socket) => {
  console.log("WebSocket connection established:", socket.id);

  const emitUpdatedData = async () => {
    try {
      const v = await filter_measure_type(socket.measure);
      socket.emit('update', v);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const emitUpdatedDuration = async () => {
    try {
      if (socket.sensorId) {
        const y = await updated_x_ago(socket.sensorId);
        socket.emit('updatedXAgo', y);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  socket.measure = null;

  socket.sensorId = null;

  socket.on("selectedMeasure", (measure) => {
    // Store the selectedMeasure in the socket object
    socket.measure = measure;
  });

  socket.on('sensorId', (sId) => {
    socket.sensorId = sId;
    console.log('Received sensorId:', sId);
  })


  emitUpdatedData(); // Initial emit
  const updateInterval = setInterval(emitUpdatedData, 10);

  emitUpdatedDuration()
  const updateIntervalOne = setInterval(emitUpdatedDuration, 3000);

  // Event listener for receiving messages from the client
  socket.on("message", (message) => {
    console.log("Received message:", message);
    // Handle the incoming message as needed
  });

  // Event listener for WebSocket connection close
  socket.on("disconnect", () => {
    console.log("WebSocket connection closed:", socket.id);
    clearInterval(updateInterval);
    clearInterval(updateIntervalOne);
  });
});

module.exports = {
  io
}
