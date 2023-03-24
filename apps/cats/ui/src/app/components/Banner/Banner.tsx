import { Container, Typography } from '@mui/material';
import { styled } from '@mui/system';
import Carousel from './Carousel';

const BannerContent = styled('div')(({ theme }) => ({
  height: 400,
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 25,
  justifyContent: 'space-around',
}));

const Tagline = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '40%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
}));

export default function Banner() {
  return (
    <div style={{ background: '#250036' }}>
      <Container>
        <BannerContent>
          <Tagline>
            <Typography
              variant="h3"
              style={{
                fontWeight: 'bold',
                marginBottom: 15,
                fontFamily: 'Montserrat',
              }}
            >
              Welcome to the BreedView
            </Typography>
            <Typography
              variant="subtitle2"
              style={{
                color: '#aeaeae',
                textTransform: 'capitalize',
              }}
            >
              Get all the Info regarding your favorite Cat Breeds
            </Typography>
          </Tagline>
          <Carousel />
        </BannerContent>
      </Container>
    </div>
  );
}
