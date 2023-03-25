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
  Skeleton,
} from '@mui/material';
import { useGetBreedsQuery } from '../services/breeds';
import { useState } from 'react';
import { Breed } from '../types';
import { visuallyHidden } from '@mui/utils';
import { getComparator, Order, stableSort } from '../utils/sort';

export default function BreedsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Breed>('id');
  const { data, isLoading } = useGetBreedsQuery();

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearch = () => {
    return (data || []).filter(
      (breed) =>
        breed.temperament.toLowerCase().includes(search) ||
        breed.id.toLowerCase().includes(search) ||
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
            {isLoading ? (
              <SkeletonTable />
            ) : (
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
            )}
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

const SkeletonTable = () => {
  return (
    <TableBody>
      {Array.from({ length: 10 }).map(() => (
        <TableRow>
          <TableCell>
            <Skeleton width="2vw" />
          </TableCell>
          <TableCell>
            <Skeleton width="6vw" />
          </TableCell>
          <TableCell>
            <Skeleton width="7vw" />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton width="9vw" />
          </TableCell>
          <TableCell>
            <Skeleton width="29vw" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};
