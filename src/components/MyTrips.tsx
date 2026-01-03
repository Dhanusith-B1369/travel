import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, MapPin, Plus, Pencil, Trash2, Eye, Globe } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
  total_budget: number;
  stopCount?: number;
}

export default function MyTrips() {
  const { user } = useAuth();
  const { navigate, goBack } = useNavigation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('trips')
        .select('*, stops(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const tripsWithCount = data.map(trip => ({
          ...trip,
          stopCount: trip.stops?.[0]?.count || 0
        }));
        setTrips(tripsWithCount);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId: string, tripName: string) => {
    if (!confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-1">Manage all your travel plans</p>
          </div>
          <button
            onClick={() => navigate({ type: 'createTrip' })}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            New Trip
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h2>
            <p className="text-gray-600 mb-6">Start planning your first adventure!</p>
            <button
              onClick={() => navigate({ type: 'createTrip' })}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div
                key={trip.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center relative">
                  {trip.is_public && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium text-gray-700">
                      <Globe className="w-3 h-3" />
                      Public
                    </div>
                  )}
                  <MapPin className="w-12 h-12 text-white/80" />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{trip.name}</h3>

                  {trip.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trip.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {trip.start_date && trip.end_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.stopCount} {trip.stopCount === 1 ? 'destination' : 'destinations'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate({ type: 'viewTrip', tripId: trip.id })}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => navigate({ type: 'editTrip', tripId: trip.id })}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trip.id, trip.name)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
