
import AliceCarousel from 'react-alice-carousel';
import { Breed } from '../../types';
import { useGetCountriesQuery } from '../../services/breeds';

export const Carousel = () => {

  const breeds = useGetCountriesQuery();
  const items = breeds.data?.map((breed: Breed) => {
    return (
      <a
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          textTransform: 'uppercase',
          color: 'white',
        }}
        href={breed.vetstreet_url}
      >
        <img
          src={`https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`}
          alt={breed.name}
          height="120"
          style={{ marginBottom: 10 }}
        />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{breed.name}</span>
      </a>
    );
  });
  const responsive = {
    0: {
      items: 2,
    },
    512: {
      items: 4,
    },
  };

  return (
    <div
      style={{
        height: '50%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={1000}
        animationDuration={1500}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        autoPlay
        items={items}
      />
    </div>
  );
};

export default Carousel;
