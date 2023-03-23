import { Homepage } from './pages/Homepage';
import './app.module.scss';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './QueryProvider/QueryProvider';
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
              <Route path="/" element={<Homepage />} />
            </Routes>
          </div>
        </Box>
      </Router>
    </QueryProvider>
  );
}

export default App;
