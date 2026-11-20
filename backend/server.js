// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Import the shared pool instance

const app = express();
app.use(cors());

// GET GeoJSON for Leaflet: http://localhost:3000/api/facilities
app.get('/api/facilities', async (req, res) => {
  try {
    const q = `
      SELECT COALESCE(
        jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::jsonb,
              'properties', jsonb_build_object('id', id, 'name', name, 'city', city)
            )
          )
        ),
        '{"type":"FeatureCollection","features":[]}'::jsonb
      ) AS geojson FROM facilities f;`;
    const { rows } = await pool.query(q);
    res.json(rows[0].geojson);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// GET facilities within radius (meters) of a point, using PostGIS ST_DWithin
// http://localhost:3000/api/facilities/nearby?lat=18.52&lng=73.85&radius=5000
app.get('/api/facilities/nearby', async (req, res) => {
  const latitude = parseFloat(req.query.lat);
  const longitude = parseFloat(req.query.lng);
  const radiusMeters = parseFloat(req.query.radius) || 5000;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({ error: 'Valid lat and lng query params are required' });
  }

  try {
    const q = `
      SELECT COALESCE(
        jsonb_build_object(
          'type', 'FeatureCollection',
          'features', jsonb_agg(
            jsonb_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::jsonb,
              'properties', jsonb_build_object('id', id, 'name', name, 'city', city)
            )
          )
        ),
        '{"type":"FeatureCollection","features":[]}'::jsonb
      ) AS geojson
      FROM facilities
      WHERE ST_DWithin(
        geom::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      );`;
    // $1 = longitude (x), $2 = latitude (y), $3 = radius in meters
    const { rows } = await pool.query(q, [longitude, latitude, radiusMeters]);
    res.json(rows[0].geojson);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT current_database()');
        res.json({
            success: true,
            database: result.rows[0].current_database
        });
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.send('Maharashtra Web GIS API is running! Use /api/facilities');
});
app.listen(3000, () => console.log('API running on http://localhost:3000'));