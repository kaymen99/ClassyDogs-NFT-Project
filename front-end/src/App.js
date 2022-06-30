import { Home, OwnerDashboard } from './pages'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
