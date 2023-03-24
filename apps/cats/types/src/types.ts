

export interface GetCatResponseDto {
  name: string;
  id: string;
  catGroup: string;
  weight: string;
  weightType: string;
}


export interface SearchCatDto {
  name?: string;
  page?: string;
  pageSize?: string;
  sort?: 'asc' | 'desc';
  sortField?: string;
}

export interface DeleteCatDto {
  id?: string;
}

export interface GetCatDto {
  id?: string;
  name?: string;
}

export interface AddCatDto {
  name: string;
  id: string;
  catGroup: string;
  weight: string;
  weightType: string;
}
