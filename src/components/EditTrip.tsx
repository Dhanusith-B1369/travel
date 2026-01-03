import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, MapPin, Calendar, DollarSign, X, Search, Save, Globe, Eye } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
}

interface Stop {
  id: string;
  city_id: string;
  start_date: string | null;
  end_date: string | null;
  order_index: number;
  accommodation_cost: number;
  transportation_cost: number;
  city?: City;
}

interface City {
  id: string;
  name: string;
  country: string;
  cost_index: number | null;
}

export default function EditTrip({ tripId }: { tripId: string }) {
  const { user } = useAuth();
  const { navigate, goBack } = useNavigation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
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

      const { data: citiesData } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (citiesData) {
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Error loading trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStop = async (cityId: string) => {
    try {
      const { data, error } = await supabase
        .from('stops')
        .insert({
          trip_id: tripId,
          city_id: cityId,
          order_index: stops.length,
        })
        .select('*, city:cities(*)')
        .single();

      if (error) throw error;
      if (data) {
        setStops([...stops, data]);
        setShowCitySearch(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error adding stop:', error);
    }
  };

  const removeStop = async (stopId: string) => {
    try {
      const { error } = await supabase
        .from('stops')
        .delete()
        .eq('id', stopId);

      if (error) throw error;
      setStops(stops.filter(s => s.id !== stopId));
    } catch (error) {
      console.error('Error removing stop:', error);
    }
  };

  const updateStopDates = async (stopId: string, startDate: string, endDate: string) => {
    try {
      const { error } = await supabase
        .from('stops')
        .update({ start_date: startDate, end_date: endDate })
        .eq('id', stopId);

      if (error) throw error;
      setStops(stops.map(s => s.id === stopId ? { ...s, start_date: startDate, end_date: endDate } : s));
    } catch (error) {
      console.error('Error updating stop dates:', error);
    }
  };

  const updateStopCost = async (stopId: string, field: 'accommodation_cost' | 'transportation_cost', value: number) => {
    try {
      const { error } = await supabase
        .from('stops')
        .update({ [field]: value })
        .eq('id', stopId);

      if (error) throw error;
      setStops(stops.map(s => s.id === stopId ? { ...s, [field]: value } : s));
    } catch (error) {
      console.error('Error updating stop cost:', error);
    }
  };

  const togglePublic = async () => {
    if (!trip) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({ is_public: !trip.is_public })
        .eq('id', tripId);

      if (error) throw error;
      setTrip({ ...trip, is_public: !trip.is_public });
    } catch (error) {
      console.error('Error updating trip visibility:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBudget = stops.reduce((sum, stop) => sum + stop.accommodation_cost + stop.transportation_cost, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip...</p>
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ type: 'viewTrip', tripId })}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={togglePublic}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  trip.is_public
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                {trip.is_public ? 'Public' : 'Private'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{trip.name}</h1>
          {trip.description && <p className="text-gray-600">{trip.description}</p>}
          {trip.start_date && trip.end_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} -{' '}
                {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Itinerary</h2>
              <button
                onClick={() => setShowCitySearch(!showCitySearch)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Plus className="w-4 h-4" />
                Add Stop
              </button>
            </div>

            {showCitySearch && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCities.map(city => (
                    <button
                      key={city.id}
                      onClick={() => addStop(city.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition"
                    >
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-600">{city.country}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stops.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No destinations yet. Add your first stop!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{stop.city?.name}</h3>
                          <p className="text-sm text-gray-600">{stop.city?.country}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStop(stop.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={stop.start_date || ''}
                          onChange={(e) => updateStopDates(stop.id, e.target.value, stop.end_date || e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={stop.end_date || ''}
                          onChange={(e) => updateStopDates(stop.id, stop.start_date || e.target.value, e.target.value)}
                          min={stop.start_date || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Accommodation Cost</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={stop.accommodation_cost}
                            onChange={(e) => updateStopCost(stop.id, 'accommodation_cost', parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Transportation Cost</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={stop.transportation_cost}
                            onChange={(e) => updateStopCost(stop.id, 'transportation_cost', parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Trip Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Destinations</span>
                  <span className="font-semibold text-gray-900">{stops.length}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Estimated Budget</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
              <h3 className="font-semibold text-blue-900 mb-2">Pro Tip</h3>
              <p className="text-sm text-blue-700">
                Add cities in the order you plan to visit them. You can adjust dates and costs for each stop to track your budget.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
