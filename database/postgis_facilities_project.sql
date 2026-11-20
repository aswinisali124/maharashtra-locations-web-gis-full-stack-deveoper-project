
-- STEP 1: Create table
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    geom GEOMETRY(Point, 4326)
);

-- STEP 1b: Spatial index (makes ST_DWithin and KNN fast on large tables)
CREATE INDEX facilities_geom_gist ON facilities USING GIST (geom);

-- STEP 2: Insert 9 points (lng, lat order!)
INSERT INTO facilities (name, city, geom) VALUES
('Gateway of India', 'Mumbai', ST_SetSRID(ST_MakePoint(72.8347, 18.9220), 4326)),
('Marine Drive', 'Mumbai', ST_SetSRID(ST_MakePoint(72.8238, 18.9440), 4326)),
('Dadar Station', 'Mumbai', ST_SetSRID(ST_MakePoint(72.8438, 19.0180), 4326)),
('Thane Station', 'Thane', ST_SetSRID(ST_MakePoint(72.9750, 19.1860), 4326)),
('Pune Station', 'Pune', ST_SetSRID(ST_MakePoint(73.8744, 18.5289), 4326)),
('Shaniwar Wada', 'Pune', ST_SetSRID(ST_MakePoint(73.8553, 18.5195), 4326)),
('Nashik Road Station', 'Nashik', ST_SetSRID(ST_MakePoint(73.8420, 19.9470), 4326)),
('Panchavati', 'Nashik', ST_SetSRID(ST_MakePoint(73.7900, 20.0059), 4326)),
('Nagpur Station', 'Nagpur', ST_SetSRID(ST_MakePoint(79.0880, 21.1500), 4326));


-- Verify
SELECT id, name, city, ST_AsText(geom) AS location FROM facilities ORDER BY id;


-- QUERY 1: Count by city
SELECT city, COUNT(*) AS total
FROM facilities
GROUP BY city
ORDER BY total DESC;

-- QUERY 2: Distance in meters / km (::geography so result is real metres)
SELECT
  a.name AS from_place,
  b.name AS to_place,
  ST_Distance(a.geom::geography, b.geom::geography) AS meters,
  ST_Distance(a.geom::geography, b.geom::geography)/1000 AS km
FROM facilities a, facilities b
WHERE a.name = 'Pune Station' AND b.name = 'Shaniwar Wada';

-- QUERY 3: Within 5 km (index-backed thanks to the GiST index)
SELECT name, city
FROM facilities
WHERE ST_DWithin(
  geom::geography,
  (SELECT geom::geography FROM facilities WHERE name = 'Shaniwar Wada'),
  5000
);

-- QUERY 4: 3 nearest (KNN with <-> operator, uses the GiST index)
SELECT name, city
FROM facilities
WHERE name <> 'Pune Station'
ORDER BY geom <-> (SELECT geom FROM facilities WHERE name = 'Pune Station')
LIMIT 3;

-- QUERY 5: Export as GeoJSON for Leaflet (null-safe)
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
)
FROM facilities f;