import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Bridge from './pages/Bridge';
import About from './pages/About';
import { WalletProvider } from './contexts/WalletContext';
import { NetworkProvider } from './contexts/NetworkContext';

function App() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <WalletProvider>
        <NetworkProvider>
          <Router>
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bridge" element={<Bridge />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </AnimatePresence>
          </Router>
        </NetworkProvider>
      </WalletProvider>

      <Toaster position="top-right" />

      <footer className="text-center text-gray-500 text-xs py-4">
        &copy; 2025 CrCo Bridge - All rights reserved.
        <span className="block mt-2">Developed by Team 401 Unauthorised</span>
      </footer>
    </div>
  );
}

export default App;