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

// use moment
const moment = require('moment-timezone');

// connect to the postresql database sensors_to_regions_measures
const pool = require("./db");


const { iot_back_socket } = require('./WebSocket/IOTWebSocket.js');

const { socket } = require('./WebSocket/DB_Back_FrontWebSocket.js');


// filter measures in map
app.get('/sensors/:temp', async (req, res) => {
  const temp = req.params.temp;

  const query = 'select s.latitude, s.longitude, s.sensor_id, m.measure_type, v.current_value from sensor s, measure m, value v where s.measure_type = m.measure_type and s.sensor_id = v.sensor_id and m.measure_type = $1';
  
  const values = [temp];
  const result = await pool.query(query, values);

  console.log(result.rows);
  res.json(result.rows);
})


// view the measure update duration regularly
app.get('/viewUpdateDuration/:sensorId', async (req, res) => {
  const sensorId = req.params.sensorId;
  const query = "SELECT last_update FROM value WHERE sensor_id = $1";
  const values = [sensorId];
  const result = await pool.query(query, values);
  const lastUpdate = moment.utc(result.rows[0].last_update).local();
  const currentDate = moment().tz('Africa/Tunis');
  
  const duration = moment.duration(currentDate.diff(lastUpdate));

  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const updatedXAgo = "Updated " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds ago";


  console.log(currentDate);
  console.log(lastUpdate);
  console.log(updatedXAgo);
  res.json({
    currentDate: currentDate.format(),
    lastUpdate: lastUpdate.format(),
    updatedXAgo: updatedXAgo,
  })
});


app.listen(process.env.port, () => {
  console.log('Express server is currently listening');
});