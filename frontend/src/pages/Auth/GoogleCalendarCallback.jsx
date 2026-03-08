import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

/**
 * Google Calendar OAuth Callback Handler
 * This page handles the OAuth redirect after user authorizes calendar access
 */
export default function GoogleCalendarCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Connecting to Google Calendar...');

  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code from URL
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      // User denied access
      if (error) {
        setStatus('error');
        setMessage('Authorization cancelled. You can close this window.');
        
        // If opened in popup, send message to parent
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_ERROR', 
            error: 'User cancelled authorization' 
          }, window.location.origin);
          
          setTimeout(() => window.close(), 2000);
        } else {
          setTimeout(() => navigate('/recruiter/calendar'), 2000);
        }
        return;
      }

      // No code received
      if (!code) {
        setStatus('error');
        setMessage('No authorization code received. Please try again.');
        
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            navigate('/recruiter/calendar');
          }
        }, 2000);
        return;
      }

      // Exchange code for tokens
      try {
        setMessage('Exchanging authorization code...');
        
        const response = await axiosClient.post('/calendar/callback', { code });

        setStatus('success');
        setMessage('Successfully connected to Google Calendar!');

        // If opened in popup, send success message to parent
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_SUCCESS',
            data: response.data 
          }, window.location.origin);
          
          setTimeout(() => window.close(), 1500);
        } else {
          setTimeout(() => navigate('/recruiter/calendar'), 1500);
        }

      } catch (error) {
        console.error('Calendar OAuth error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Failed to connect to Google Calendar. Please try again.'
        );

        if (window.opener) {
          window.opener.postMessage({ 
            type: 'GOOGLE_CALENDAR_AUTH_ERROR',
            error: error.response?.data?.message || 'Connection failed'
          }, window.location.origin);
          
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => navigate('/recruiter/calendar'), 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {status === 'processing' && (
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle className="w-16 h-16 text-green-600" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-600" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {status === 'processing' && 'Connecting...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Connection Failed'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Progress Indicator */}
        {status === 'processing' && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full animate-pulse" style={{ width: '70%' }} />
          </div>
        )}

        {/* Auto close message */}
        {status !== 'processing' && (
          <p className="text-sm text-gray-500 mt-4">
            {window.opener ? 'This window will close automatically...' : 'Redirecting...'}
          </p>
        )}
      </div>
    </div>
  );
}
