import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { supabase } from '../lib/supabase';
import { Plane, Plus, Calendar, MapPin, DollarSign, LogOut, User, TrendingUp } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_photo_url: string | null;
  total_budget: number;
  stopCount?: number;
}

interface City {
  id: string;
  name: string;
  country: string;
  image_url: string | null;
  popularity_score: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { navigate } = useNavigation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*, stops(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (tripsData) {
        const tripsWithCount = tripsData.map(trip => ({
          ...trip,
          stopCount: trip.stops?.[0]?.count || 0
        }));
        setTrips(tripsWithCount);
      }

      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(6);

      if (citiesData) {
        setPopularCities(citiesData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">GlobeTrotter</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ type: 'myTrips' })}
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                My Trips
              </button>
              <button
                onClick={() => navigate({ type: 'profile' })}
                className="p-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={signOut}
                className="p-2 text-gray-700 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">Plan your next adventure or continue where you left off</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Trips</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{trips.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Upcoming</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {trips.filter(t => t.start_date && new Date(t.start_date) > new Date()).length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Budget</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${trips.reduce((sum, t) => sum + (t.total_budget || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Trips</h2>
              <button
                onClick={() => navigate({ type: 'myTrips' })}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
                <Plane className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No trips yet. Start planning your first adventure!</p>
                <button
                  onClick={() => navigate({ type: 'createTrip' })}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  <Plus className="w-4 h-4" />
                  Plan New Trip
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => navigate({ type: 'viewTrip', tripId: trip.id })}
                    className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{trip.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {trip.start_date && trip.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                        </div>
                      )}
                      {trip.stopCount !== undefined && trip.stopCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.stopCount} {trip.stopCount === 1 ? 'stop' : 'stops'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate({ type: 'createTrip' })}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition"
            >
              <Plus className="w-5 h-5" />
              Plan New Trip
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
            </div>

            {popularCities.length === 0 ? (
              <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No cities available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {popularCities.map(city => (
                  <div
                    key={city.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="h-32 bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                      {city.image_url ? (
                        <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm">{city.name}</h3>
                      <p className="text-xs text-gray-600">{city.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
