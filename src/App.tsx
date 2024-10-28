import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

const App: React.FC = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // State to show details


  const apiKey =  import.meta.env.VITE_WEATHER_API;

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}`
      );
      setWeatherData(response.data);
      setShowResult(true);
    } catch (err) {
      setError('Could not fetch the weather data. Please try again.');
    }
    setLoading(false);
  };

  const handleMapClick = async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    setMapCoords({ lat, lon });
    try {
      console.log(lat,lon)
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1`
      );
      setWeatherData(response.data);
      setShowResult(true);
    } catch (err) {
      setError('Could not fetch the weather data. Please try again.');
    }
    setLoading(false);
  };

  const LocationMarker = () => {
    useMapEvents({
      click: (e) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return mapCoords ? (
      <Marker position={[mapCoords.lat, mapCoords.lon]}>
        <Popup>
          Latitude: {mapCoords.lat}, Longitude: {mapCoords.lon}
        </Popup>
      </Marker>
    ) : null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-center text-3xl font-bold mb-6 text-gray-800">Weather Forecast</h1>

        <AnimatePresence mode="wait">
          {!showResult && (
            <motion.div
              key="inputCard"
              className="p-6 bg-white rounded-lg shadow-xl"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.6 }}
            >
              <input
                type="text"
                placeholder="Enter location"
                className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none text-gray-800"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                className="w-full p-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
                onClick={handleSearch}
              >
                Search
              </button>
            </motion.div>
          )}

          {showResult && (
            <motion.div
              key="resultCard"
              className="p-6 bg-white rounded-lg shadow-xl text-center"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.6 }}
            >
              {loading && <p className="animate-pulse text-gray-600">Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {weatherData && (
                <>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                    {weatherData.location.name}, {weatherData.location.country}
                  </h2>
                  <p className="text-lg text-gray-600">{weatherData.current.condition.text}</p>
                  <p className="text-5xl font-bold text-blue-500">{weatherData.current.temp_c}°C</p>
                  <img
                    src={weatherData.current.condition.icon}
                    alt="Weather Icon"
                    className="mx-auto my-4 w-20 h-20"
                  />
                  <button
                    className="mt-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                   {showDetails ? 'Hide Details' : 'View Details'} 
                  </button>
                  <button
                  className="mt-2 p-2 ml-2 bg-green-500 text-white rounded-lg hover:bg-gray-600 shadow-md"
                  onClick={() => {
                    setShowResult(false);
                    setShowDetails(false);
                    }}>
                    New Search
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weather Details */}
        {showDetails && weatherData && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-semibold">Temperature</h3>
              <p>{weatherData.current.temp_c}°C / {weatherData.current.temp_f}°F</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-semibold">Feels Like</h3>
              <p>{weatherData.current.feelslike_c}°C / {weatherData.current.feelslike_f}°F</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-semibold">Humidity</h3>
              <p>{weatherData.current.humidity}%</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-semibold">Wind Speed</h3>
              <p>{weatherData.current.wind_kph} km/h</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-semibold">Wind Direction</h3>
              <p>{weatherData.current.wind_dir}</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-semibold">Visibility</h3>
              <p>{weatherData.current.vis_km} km</p>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="h-96 w-full mt-4 rounded-lg overflow-hidden shadow-md">
          <MapContainer center={[20, 78]} zoom={5} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <LocationMarker />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default App;
