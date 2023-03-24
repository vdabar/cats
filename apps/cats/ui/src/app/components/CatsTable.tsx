import {
  Container,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import { useDeleteCat, useGetCatsQuery } from '../services/cats';
import deleteIcon from '../../assets/delete.png';

export default function CatsTable() {
  const cats = useGetCatsQuery();
  const mutation = useDeleteCat();
  const handleDelete = (id: string) => {
    mutation.mutate({ id });
  };
  return (
    <Container sx={{ textAlign: 'center' }}>
      <Paper
        sx={{
          width: '100%',
          overflow: 'hidden',
          marginTop: '2rem',
          marginBottom: '2em',
        }}
      >
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>id</b>
                </TableCell>
                <TableCell>
                  <b>name</b>
                </TableCell>
                <TableCell>
                  <b>catGroup</b>
                </TableCell>
                <TableCell>
                  <b>weight</b>
                </TableCell>
                <TableCell>
                  <b>weightType</b>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cats.data?.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.catGroup}</TableCell>
                  <TableCell>{row.weight}</TableCell>
                  <TableCell>{row.weightType}</TableCell>
                  <TableCell align="right">
                    <img
                      src={deleteIcon}
                      alt={'delete'}
                      onClick={() => {
                        handleDelete(row.id);
                      }}
                      style={{
                        cursor: 'pointer',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
