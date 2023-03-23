import {
  TextField,
  Typography,
  Container,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  TableSortLabel,
  Box,
} from '@mui/material';
import { useGetCountriesQuery } from '../services/breeds';
import { useState } from 'react';
import { Breed } from '../types';
import { visuallyHidden } from '@mui/utils';

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: unknown }, b: { [key in Key]: unknown }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

export default function BreedsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Breed>('id');
  const breeds = useGetCountriesQuery();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearch = () => {
    return (breeds.data || []).filter(
      (breed) =>
        breed.name.toLowerCase().includes(search) ||
        breed.description.toLowerCase().includes(search)
    );
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: keyof Breed
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const navigate = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Container sx={{ textAlign: 'center' }}>
      <Typography
        variant="h4"
        style={{ margin: 18, fontFamily: 'Montserrat', color: '#000000de' }}
      >
        Breeds by thecatapi
      </Typography>
      <TextField
        label="Search For a Breed"
        variant="outlined"
        color="primary"
        sx={{ marginBottom: '20', width: '100%' }}
        onChange={(e) => setSearch(e.target.value)}
      ></TextField>
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
                <TableCell sortDirection={orderBy === 'id' ? order : false}>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, 'id')}
                  >
                    <b>Id</b>
                    {orderBy === 'id' ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc'
                          ? 'sorted descending'
                          : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <b>Photo</b>
                </TableCell>
                <TableCell>
                  <b>Name</b>
                </TableCell>
                <TableCell>
                  <b>Energy</b>
                </TableCell>
                <TableCell>
                  <b>Temperament</b>
                </TableCell>
                <TableCell>
                  <b>Description</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(handleSearch(), getComparator(order, orderBy))
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    key={row.name}
                    onClick={() => navigate(row.vetstreet_url)}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#d7d7d7',
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <img
                        src={`https://cdn2.thecatapi.com/images/${row.reference_image_id}.jpg`}
                        alt={row.name}
                        height="50"
                      />
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.energy_level}</TableCell>
                    <TableCell>{row.temperament}</TableCell>
                    <TableCell>{row.description}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={handleSearch()?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}
