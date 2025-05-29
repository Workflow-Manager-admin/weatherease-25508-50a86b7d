import React, { useEffect, useState } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  // UI STATES
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [error, setError] = useState('');
  const [locationUsed, setLocationUsed] = useState(false);

  const API_KEY = 'AIzaSyBfu-HABrOrRW0CIdzpyLV0dlKdBQDVB3c'; // PUBLIC: Must be replaced with a valid key

  // UTILITY: Format temperature
  function formatTemperature(tempK) {
    if (typeof tempK !== 'number') return '--';
    return Math.round(tempK - 273.15);
  }

  // Fetch weather by coordinates
  // PUBLIC_INTERFACE
  async function fetchWeatherByCoords(lat, lon) {
    setLoading(true); setError('');
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&appid=${API_KEY}`
      );
      if (!resp.ok) throw new Error('Could not fetch weather');
      const data = await resp.json();
      if (data.cod && data.cod !== 200) throw new Error(data.message);
      setWeather(data);
      setLocationUsed(true);
    } catch (e) {
      setError('Unable to retrieve weather for your location.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  // Fetch weather by city name
  // PUBLIC_INTERFACE
  async function fetchWeatherByCity(city) {
    if (!city) return;
    setLoading(true); setError('');
    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}`
      );
      if (!resp.ok) {
        if (resp.status === 404) {
          setError('City not found. Please check the spelling.');
        } else {
          setError('Could not fetch weather for the specified city.');
        }
        setWeather(null);
      } else {
        const data = await resp.json();
        setWeather(data);
        setLocationUsed(false);
      }
    } catch (e) {
      setError('Network error while retrieving city weather.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  // On mount, try to get user's location for weather
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported. Please search for a city.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (err) => {
        setError("Location access denied. Use the search to find your weather.");
        setLoading(false);
      }
    );
    // eslint-disable-next-line
  }, []);

  // Handle form submission (city search)
  // PUBLIC_INTERFACE
  function handleSearchSubmit(e) {
    e.preventDefault();
    if (cityInput.trim().length === 0) {
      setError("Please enter a city name.");
      return;
    }
    fetchWeatherByCity(cityInput.trim());
  }

  // Handle input change
  function handleInputChange(e) {
    setCityInput(e.target.value);
    setError('');
  }

  // Styling palette as per requirements
  const color = {
    primary: '#2196F3',
    secondary: '#FFFFFF',
    accent: '#FFC107'
  };

  // Responsive card style
  const cardStyle = {
    background: color.secondary,
    color: "#222",
    maxWidth: 400,
    width: "100%",
    borderRadius: 18,
    margin: "36px auto",
    padding: "2.5rem 2rem 2.25rem 2rem",
    boxShadow: "0 3px 25px #202a401f",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  // PUBLIC_INTERFACE
  function WeatherIcon({ icon, alt }) {
    if (!icon) return null;
    return (
      <img
        src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
        alt={alt || ""}
        style={{ width: 88, marginBottom: 4 }}
      />
    );
  }

  return (
    <div className="app" style={{ background: "#f5f8fa", minHeight: "100vh" }}>
      <nav className="navbar" style={{ background: color.primary }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo" style={{ color: "#fff" }}>
              <span className="logo-symbol" style={{ color: color.accent, marginRight: 4 }}>☀</span> WeatherEase
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="container" style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={cardStyle}>
            <form
              onSubmit={handleSearchSubmit}
              style={{ width: "100%", marginBottom: 18, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 12 }}
              autoComplete="off"
              spellCheck="false"
            >
              <input
                type="text"
                placeholder="Search city (e.g. London)"
                value={cityInput}
                onChange={handleInputChange}
                style={{
                  padding: "11px 15px",
                  border: `1.5px solid ${color.primary}`,
                  borderRadius: 6,
                  fontSize: "1.1rem",
                  background: "#fff",
                  color: "#222",
                  outline: "none",
                  width: "100%",
                  transition: "border 0.2s",
                }}
                aria-label="Search for a city"
                disabled={loading}
              />
              <button
                className="btn"
                type="submit"
                style={{
                  backgroundColor: color.primary,
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: "1.09rem",
                  padding: "11px",
                  color: "#fff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 1px 4px rgba(33,150,243,0.09)",
                  transition: "background 0.18s",
                }}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Get Weather'}
              </button>
            </form>
            {error &&
              <div
                style={{
                  color: "#D01919",
                  background: "#fff0f0",
                  border: "1px solid #ffd0d0",
                  padding: "0.6em 1em",
                  borderRadius: 8,
                  marginBottom: 12,
                  textAlign: "center",
                  fontSize: "1.07em",
                  width: "100%"
                }}
                role="alert"
              >{error}</div>
            }
            {weather && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexGrow: 1,
                width: "100%"
              }}>
                <WeatherIcon icon={weather.weather?.[0]?.icon} alt={weather.weather?.[0]?.main} />
                <div style={{
                  fontWeight: 600,
                  fontSize: "2.5rem",
                  color: color.primary,
                  marginBottom: 3,
                  letterSpacing: "0.5px",
                }}>
                  {formatTemperature(weather.main?.temp)}°C
                </div>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "#444",
                  marginBottom: 13,
                }}>
                  {weather.weather?.[0]?.main}
                </div>
                <div style={{
                  fontSize: "1.08rem",
                  color: "#5a5a5a",
                  marginBottom: 6
                }}>
                  <b>{weather.name}</b>{weather.sys?.country ? `, ${weather.sys.country}` : ''}
                </div>
                <div style={{
                  fontSize: "1.02rem",
                  color: "#858585",
                }}>
                  {locationUsed ?
                    <span style={{ color: color.accent }}>• Based on your location</span>
                    :
                    <span style={{ color: "#bac5c5" }}>• Searched by city</span>
                  }
                </div>
              </div>
            )}
            {!weather && !loading && !error && (
              <div style={{ color: "#7a7a7a", fontSize: "1.1rem", marginTop: 18, textAlign: "center" }}>
                Enter a city name above or allow location access to see the current weather.
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Extra: Minimal CSS for mobile responsiveness */}
      <style>{`
        @media (max-width: 500px) {
          .container { padding-left: 0; padding-right: 0; }
          nav.navbar { padding: 12px !important; }
        }
      `}</style>
    </div>
  );
}

export default App;