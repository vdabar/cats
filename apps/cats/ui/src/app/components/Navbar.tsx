import { AppBar, Toolbar, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/telia.png';
export default function Navbar() {
  const navigate = useNavigate();
  return (
    <AppBar sx={{ backgroundColor: '#fff' }} position="static">
      <Container>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <img
              src={logo}
              alt="Logo"
              height="40"
              style={{ marginRight: 15, marginBottom: 7 }}
            />
            <div
              style={{
                borderLeft: '1px solid #d6d3d3',
                paddingLeft: '15px',
                color: 'black',
              }}
            >
              Breed View
            </div>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
