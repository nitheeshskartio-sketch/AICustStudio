import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductPage from './pages/ProductPage';
import StudioPage from './pages/StudioPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/product" element={<ProductPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/" element={<Navigate to="/product" replace />} />
      </Routes>
    </Router>
  );
}
