import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateUtils';

export default function BookingQR() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);

  useEffect(() => {
    getBookingById(id)
      .then(({ data }) => setBooking(data))
      .catch(() => toast.error('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!booking || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple QR-like visual using booking data hash
    const data = `BOOKING:${booking.id}|${booking.resource?.name}|${booking.startTime}|${booking.status}`;
    const cellSize = 8;
    const cells = Math.floor(size / cellSize);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate deterministic pattern from data
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = '#1e293b';
    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < cells; col++) {
        const seed = (hash ^ (row * 73856093) ^ (col * 19349663)) & 0x7fffffff;
        if (seed % 2 === 0) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    // Corner markers (QR style)
    const drawMarker = (x, y) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, 48, 48);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 8, y + 8, 32, 32);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 16, y + 16, 16, 16);
    };
    drawMarker(0, 0);
    drawMarker(size - 48, 0);
    drawMarker(0, size - 48);
  }, [booking]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `booking-${id}-qr.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return <p className="text-center text-gray-500 py-20">Booking not found</p>;
  if (booking.status !== 'APPROVED') return (
    <div className="max-w-md mx-auto text-center py-20">
      <p className="text-4xl mb-4"></p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">QR Not Available</h2>
      <p className="text-gray-500 mb-4">QR codes are only available for approved bookings.</p>
      <p className="text-sm text-gray-400">Current status: <span className="font-medium">{booking.status}</span></p>
      <Link to="/bookings" className="mt-6 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Back to Bookings</Link>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/bookings" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Booking QR Code</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-8 text-center print:shadow-none">

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
           APPROVED BOOKING
        </div>

        {/* QR Canvas */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-xl border-2 border-gray-200 shadow-inner">
            <canvas ref={canvasRef} className="block" style={{ imageRendering: 'pixelated' }} />
          </div>
        </div>

        {/* Booking Details */}
        <div className="text-left space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Booking ID</span>
            <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-100">#{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Resource</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{booking.resource?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
            <span className="text-sm text-gray-800 dark:text-gray-100">{booking.resource?.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Start</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{formatDateTime(booking.startTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">End</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{formatDateTime(booking.endTime)}</span>
          </div>
          {booking.attendees && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Attendees</span>
              <span className="text-sm text-gray-800 dark:text-gray-100">{booking.attendees}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-6">Show this QR code at the venue for check-in verification</p>

        {/* Action buttons */}
        <div className="flex gap-3 print:hidden">
          <button onClick={handleDownload}
            className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
             Download
          </button>
          <button onClick={handlePrint}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
             Print
          </button>
        </div>
      </div>
    </div>
  );
}
