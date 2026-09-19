import { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      setError('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(base64Image);
    onCapture(base64Image);

    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  useEffect(() => {
    return () => stopCamera(); // cleanup on unmount
  }, []);

  return (
    <div className="camera-capture">
      {!capturedImage && (
        <>
          <video ref={videoRef} autoPlay playsInline className="camera-video" />
          {!isCameraOn ? (
            <button type="button" onClick={startCamera}>
              Start Camera
            </button>
          ) : (
            <button type="button" onClick={capturePhoto}>
              Capture Selfie
            </button>
          )}
        </>
      )}

      {capturedImage && (
        <>
          <img src={capturedImage} alt="Captured selfie" className="captured-image" />
          <button type="button" onClick={retake}>
            Retake
          </button>
        </>
      )}

      {error && <p className="error-text">{error}</p>}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCapture;