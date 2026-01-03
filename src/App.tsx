import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CreateTrip from './components/CreateTrip';
import MyTrips from './components/MyTrips';
import EditTrip from './components/EditTrip';
import ViewTrip from './components/ViewTrip';
import Profile from './components/Profile';

function AppContent() {
  const { user, loading } = useAuth();
  const { currentScreen } = useNavigation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  switch (currentScreen.type) {
    case 'dashboard':
      return <Dashboard />;
    case 'myTrips':
      return <MyTrips />;
    case 'createTrip':
      return <CreateTrip />;
    case 'editTrip':
      return <EditTrip tripId={currentScreen.tripId} />;
    case 'viewTrip':
      return <ViewTrip tripId={currentScreen.tripId} />;
    case 'publicTrip':
      return <ViewTrip tripId={currentScreen.tripId} isPublic />;
    case 'profile':
      return <Profile />;
    default:
      return <Dashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
