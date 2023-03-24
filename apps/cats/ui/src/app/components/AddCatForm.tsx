import { TextField, Button, Container } from '@mui/material';
import { useForm } from 'react-hook-form';
import { AddCatDto } from '@cats/cats/types';
import { useAddCat } from '../services/cats';

export default function AddCatForm() {
  const { register, handleSubmit } = useForm();
  const mutation = useAddCat();
  const onSubmit = (data: unknown) => {
    mutation.mutate(data as AddCatDto);
  };
  return (
    <Container
      sx={{
        marginTop: '2rem',
        marginBottom: '2em',
      }}
    >
      <form
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField id="id" label="id" {...register('id')} required />
        <TextField id="name" label="name" {...register('name')} required />
        <TextField
          id="catGroup"
          label="catGroup"
          {...register('catGroup')}
          required
        />
        <TextField
          id="weight"
          label="weight"
          {...register('weight')}
          required
        />
        <TextField
          id="weightType"
          label="weightType"
          {...register('weightType')}
          required
        />
        <Button
          type="submit"
          variant="contained"
          style={{ backgroundColor: '#250036' }}
          {...register('submit')}
        >
          Add
        </Button>
      </form>
    </Container>
  );
}
