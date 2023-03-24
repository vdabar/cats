import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AddCatDto, DeleteCatDto, GetCatResponseDto } from '@cats/cats/types';

export const useGetCatsQuery = () => {
  return useQuery({
    queryKey: ['cats'],
    queryFn: async () => {
      const { data } = await axios.get<GetCatResponseDto[]>('api/cats');

      return data;
    },
  });
};

export const useAddCat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCat: AddCatDto) => await axios.post(`/api/cats`, newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
    },
  });
};

export const useDeleteCat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({id}: DeleteCatDto) => await axios.delete(`/api/cats?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
    },
  });
};
