import Banner from '../components/Banner/Banner';
import BreedsTable from '../components/BreedsTable';
import Navbar from '../components/Navbar';

export const Homepage = () => {
  return (
    <div className="gradient-background">
      <Navbar />
      <Banner />
      <BreedsTable />
    </div>
  );
};

export default Homepage;
