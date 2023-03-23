import { Homepage } from './pages/Homepage';
import './app.module.scss';
import { Box } from "@mui/material";
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import 'react-alice-carousel/lib/alice-carousel.css';
export function App() {
  return (
    <Router>
      <Box  sx={{
          backgroundColor: "#1F2937",
          color: "white",
          minHeight: "100vh",
        }}>
      <div>
        <Routes>
        <Route path='/' element={<Homepage/>}/>
        </Routes>
      </div>
      </Box>
    </Router>
  );
}

export default App;
