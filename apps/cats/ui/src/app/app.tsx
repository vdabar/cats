import Breeds from './pages/Breeds';
import './app.module.scss';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './QueryProvider/QueryProvider';
import Cats from './pages/Cats';
export function App() {
  return (
    <QueryProvider>
      <Router>
        <Box
          sx={{
            color: '#fafafa',
            minHeight: '100vh',
          }}
        >
          <div>
            <Routes>
              <Route path="/" element={<Breeds />} />
              <Route path="/Cats" element={<Cats />} />
            </Routes>
          </div>
        </Box>
      </Router>
    </QueryProvider>
  );
}

export default App;
