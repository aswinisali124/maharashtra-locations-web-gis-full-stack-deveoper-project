# Maharashtra Locations – Web GIS

An interactive web map that shows important locations in Maharashtra (Mumbai, Thane, Pune, Nashik and Nagpur).
The location data is stored in a **PostgreSQL + PostGIS** database, served by a **Node.js API**, and shown on a **Leaflet** map in the browser.

---

## Features

- Interactive map of Maharashtra with colored markers for each city
- Marker clusters: nearby points group together and split when you zoom in
- Dashboard cards showing the total number of locations and the count for each city
- Search by location name or city
- Filter by city using the dropdown
- Table of locations with a **Zoom** button that flies to the location on the map
- Click a marker to see its name, city, latitude and longitude
- Switch between 5 base maps: OpenStreetMap, Satellite, Terrain, Toner and Light Map
- Turn layers on and off (Location Clusters and Pune Facilities)
- Scale bar and north arrow on the map
- Pune facilities (College of Engineering, Hospital, Mula River) shown as polygons from a GeoJSON file
- Works on desktop, tablet and mobile screens
- If the backend is not running, the website still works using built-in sample data

---

## Technologies Used

| Part      | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | HTML, CSS, JavaScript, Leaflet.js, Leaflet MarkerCluster |
| Backend   | Node.js, Express, CORS, dotenv, pg        |
| Database  | PostgreSQL with PostGIS extension         |
| Tools     | pgAdmin 4, VS Code (Live Server)          |

---

## Project Structure

| Folder | Files | Purpose |
|--------|-------|---------|
| `frontend/` | `index.html` | Web page layout |
| | `style.css` | Design and colors |
| | `script.js` | Map, search, filter and table logic |
| | `pune_facilities.geojson` | Pune polygons (college, hospital, river) |
| `backend/` | `server.js` | API routes |
| | `db.js` | Database connection |
| | `package.json` | Project dependencies |
| | `.env.example` | Sample settings file |
| | `.gitignore` | Files Git should ignore |
| `database/` | `postgis_facilities_project.sql` | Creates the table and adds data |
| `screenshoots/` | Image files | Screenshots of the project |

---

## How It Works

1. You open the website (frontend) in the browser.
2. The frontend asks the backend for data at `http://localhost:3000/api/facilities`.
3. The backend runs a PostGIS query on the database.
4. The database sends back the locations as GeoJSON.
5. The frontend shows them on the map, in the table and in the dashboard cards.

---

## How to Run the Project

### What you need first

- Node.js
- PostgreSQL with the PostGIS extension
- pgAdmin 4 (comes with PostgreSQL)
- VS Code with the Live Server extension (or any simple web server)

### Step 1: Set up the database

1. Open pgAdmin and create a new database named `gis_db`.
2. Open the Query Tool for `gis_db` and run `CREATE EXTENSION IF NOT EXISTS postgis;` once.
3. Open `database/postgis_facilities_project.sql` and run it. This creates the `facilities` table and inserts 9 locations.
4. Check that it worked by running `SELECT * FROM facilities;`

### Step 2: Start the backend

1. Open a terminal and go into the `backend` folder.
2. Install the packages with `npm install`.
3. Make a copy of `.env.example`, name it `.env`, and put your own PostgreSQL password in it. The settings are:

| Setting | Value |
|---------|-------|
| `PGUSER` | `postgres` |
| `PGHOST` | `localhost` |
| `PGDATABASE` | `gis_db` |
| `PGPASSWORD` | your PostgreSQL password |
| `PGPORT` | `5432` |

4. Start the server with `npm start`.
5. You should see the message `API running on http://localhost:3000`.

### Step 3: Start the frontend

1. Open the `frontend` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.
3. The site opens at `http://127.0.0.1:5500/index.html`.

> Keep `pune_facilities.geojson` in the same folder as `index.html`, because the website loads it from there.

---

## API Endpoints

| Endpoint | What it does |
|----------|--------------|
| `/` | Checks that the API is running |
| `/api/facilities` | Returns all locations as GeoJSON |
| `/api/facilities/nearby` | Returns locations within a radius of a point. Use the query values `lat`, `lng` and `radius` (in meters) |
| `/api/test-db` | Checks the database connection |

---

## Database Table

**Table name:** `facilities`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL (Primary Key) | Unique number for each location |
| `name` | VARCHAR(150) | Name of the location |
| `city` | VARCHAR(100) | City name |
| `geom` | GEOMETRY(Point, 4326) | Location on the map (longitude, latitude) |

A spatial (GiST) index is added on `geom` to make location searches fast.

The SQL file also includes example PostGIS queries:

1. Count locations in each city
2. Find the distance between two places
3. Find places within 5 km
4. Find the 3 nearest places
5. Export the data as GeoJSON for Leaflet

---

## Locations in the Database

| City | Locations |
|------|-----------|
| Mumbai | Gateway of India, Marine Drive, Dadar Station |
| Thane | Thane Station |
| Pune | Pune Station, Shaniwar Wada |
| Nashik | Nashik Road Station, Panchavati |
| Nagpur | Nagpur Station |

---

## Screenshots

### Home page with dashboard, map and table
![Home Page](screenshoots/Screenshot__4_.png)

### Zoomed in on a location with popup
![Zoom to location](screenshoots/Screenshot__5_.png)

### Search with satellite map
![Search and satellite view](screenshoots/Screenshot__6_.png)

### Database in pgAdmin
![Database table](screenshoots/Screenshot___1_.png)

### Query: places within 5 km
![Within 5 km](screenshoots/Screenshot__2_.png)

### Query: 3 nearest places
![Nearest places](screenshoots/Screenshot__3_.png)

---

## Common Problems

- **Map is empty or the numbers show 0:** Make sure the backend is running and the database has data.
- **Database error on the backend:** Check your password in `.env` and make sure PostgreSQL is running.
- **Error saying `st_asgeojson` does not exist:** Run `CREATE EXTENSION postgis;` in your `gis_db` database.
- **Toner base map shows grey tiles:** That map (Stadia Maps) needs an API key for heavy use. Use OpenStreetMap, Satellite or Light Map instead.
- **Pune polygons not showing:** Check that `pune_facilities.geojson` is in the same folder as `index.html`.

---

## Future Improvements

- Add more cities and more locations
- Add a form to add, edit and delete locations
- Use the nearby API on the map (for example, "find places near me")
- Deploy the project online

---

## Author

**aswinisali124**
GitHub: [github.com/aswinisali124](https://github.com/aswinisali124)
