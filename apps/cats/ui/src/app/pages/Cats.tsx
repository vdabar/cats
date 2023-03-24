import AddCatForm from '../components/AddCatForm';
import CatsTable from '../components/CatsTable';
import Navbar from '../components/Navbar';

export default function Cats() {
  return (
    <div>
      <Navbar />
      <AddCatForm/>
      <CatsTable />
    </div>
  );
}
