import { useEffect, useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, MapPin, DollarSign, Pencil, Globe, Clock } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
  user_id: string;
}

interface Stop {
  id: string;
  start_date: string | null;
  end_date: string | null;
  accommodation_cost: number;
  transportation_cost: number;
  city?: {
    id: string;
    name: string;
    country: string;
    description: string | null;
  };
}

export default function ViewTrip({ tripId, isPublic = false }: { tripId: string; isPublic?: boolean }) {
  const { navigate, goBack } = useNavigation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const { data: tripData } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (tripData) {
        setTrip(tripData);
      }

      const { data: stopsData } = await supabase
        .from('stops')
        .select('*, city:cities(*)')
        .eq('trip_id', tripId)
        .order('order_index');

      if (stopsData) {
        setStops(stopsData);
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const calculateDays = (start: string | null, end: string | null) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalBudget = stops.reduce((sum, stop) => sum + stop.accommodation_cost + stop.transportation_cost, 0);
  const totalDays = stops.reduce((sum, stop) => sum + calculateDays(stop.start_date, stop.end_date), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Trip not found</p>
          <button onClick={goBack} className="mt-4 text-blue-600 hover:text-blue-700">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">{trip.name}</h1>
                {trip.is_public && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Public
                  </span>
                )}
              </div>
              {trip.description && (
                <p className="text-blue-100 text-lg mb-4">{trip.description}</p>
              )}
              {trip.start_date && trip.end_date && (
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
                </div>
              )}
            </div>

            {!isPublic && (
              <button
                onClick={() => navigate({ type: 'editTrip', tripId })}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition"
              >
                <Pencil className="w-4 h-4" />
                Edit Trip
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Destinations</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stops.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Duration</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalDays} <span className="text-lg text-gray-600">days</span></p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Budget</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Itinerary</h2>
          </div>

          {stops.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No destinations added yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stops.map((stop, index) => {
                const days = calculateDays(stop.start_date, stop.end_date);
                const stopTotal = stop.accommodation_cost + stop.transportation_cost;

                return (
                  <div key={stop.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{stop.city?.name}</h3>
                        <p className="text-gray-600 mb-3">{stop.city?.country}</p>

                        {stop.city?.description && (
                          <p className="text-gray-700 mb-4">{stop.city.description}</p>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                          {stop.start_date && stop.end_date && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(stop.start_date)} - {formatDate(stop.end_date)}</span>
                            </div>
                          )}
                          {days > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{days} {days === 1 ? 'day' : 'days'}</span>
                            </div>
                          )}
                        </div>

                        {stopTotal > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Estimated Costs</div>
                            <div className="space-y-2">
                              {stop.accommodation_cost > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Accommodation</span>
                                  <span className="font-medium text-gray-900">${stop.accommodation_cost.toLocaleString()}</span>
                                </div>
                              )}
                              {stop.transportation_cost > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Transportation</span>
                                  <span className="font-medium text-gray-900">${stop.transportation_cost.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">${stopTotal.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
