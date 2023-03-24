import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Breed } from '../types';

export const useGetBreedsQuery = () => {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: async () => {
      const { data } = await axios.get<Breed[]>(
        'https://api.thecatapi.com/v1/breeds',
        {
          params: { limit: 100 },
        }
      );

      return data;
    },
  });
};
