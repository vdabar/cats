import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/telia.png';
export default function Navbar() {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Breeds', path: '/' },
    { label: 'Cats', path: '/cats' },
  ];
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
            <Button
              sx={{
                color: '#000',
                borderLeft: '1px solid #d6d3d3',
                paddingLeft: '15px',
              }}
            >
              Breed View
            </Button>
          </div>
          <Divider />
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                sx={{ color: '#000' }}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
