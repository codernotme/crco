import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Bridge from './pages/Bridge';
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
              </Routes>
            </AnimatePresence>
          </Router>
        </NetworkProvider>
      </WalletProvider>
    </div>
  );
}

export default App;