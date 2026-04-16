import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </AuthProvider>
      </NotificationProvider>
    </Router>
  );
}

export default App;
