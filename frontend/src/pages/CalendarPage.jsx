import React, { useState, useEffect } from 'react';
import { calendarAPI } from '../api';
import { Calendar, RefreshCw, MapPin, Clock, AlertCircle } from 'lucide-react';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await calendarAPI.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await calendarAPI.sync();
      await fetchEvents();
    } catch (error) {
      console.error('Error syncing calendar:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'All day';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr;
    }
  };

  const formatDate = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Calendar Events</h1>
          <p className="text-gray-500 mt-1">Your Google Calendar events synced via MCP</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Calendar'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-700 font-medium">Google Calendar MCP Integration</p>
          <p className="text-xs text-blue-600 mt-1">
            Events are fetched from Google Calendar via MCP. For demo purposes, sample events are shown when MCP is not connected.
          </p>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No events found</h3>
            <p className="text-gray-500 mt-1">Sync your Google Calendar to see events</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 rounded-lg p-3 flex-shrink-0">
                  <Calendar size={24} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(event.start_time)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CalendarPage;