import { useState } from 'react';

const LocationCapture = ({ onCapture }) => {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');

  const getLocation = () => {
    setStatus('loading');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(location);
        setStatus('success');
        onCapture(location);
      },
      (err) => {
        setError(err.message || 'Unable to retrieve location');
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-capture">
      <button type="button" onClick={getLocation} disabled={status === 'loading'}>
        {status === 'loading' ? 'Getting location...' : 'Capture Location'}
      </button>

      {status === 'success' && coords && (
        <p className="success-text">
          📍 Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
        </p>
      )}

      {status === 'error' && <p className="error-text">{error}</p>}
    </div>
  );
};

export default LocationCapture;