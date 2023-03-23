

export interface Cat {
  name: string;
  id: string;
  catGroup: string;
  weight: string;
  weightType: string;
}


export interface SearchParams {
  name?: string;
  page?: string;
  pageSize?: string;
  sort?: 'asc' | 'desc';
  sortField?: string;
}

export interface DeleteParams {
  id?: string;
}

export interface GetParams {
  id?: string;
  name?: string;
}

export interface PostParams {
  name: string;
  id: string;
  catGroup: string;
  weight: string;
  weightType: string;
}
