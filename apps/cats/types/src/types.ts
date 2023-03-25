// export interface Cat {
//   weight: Weight;
//   id: string;
//   name: string;
//   cfa_url: string;
//   vetstreet_url: string;
//   vcahospitals_url: string;
//   temperament: string;
//   origin: string;
//   country_codes: string;
//   country_code: string;
//   description: string;
//   life_span: string;
//   indoor: number;
//   lap: number;
//   alt_names: string;
//   adaptability: number;
//   affection_level: number;
//   child_friendly: number;
//   dog_friendly: number;
//   energy_level: number;
//   grooming: number;
//   health_issues: number;
//   intelligence: number;
//   shedding_level: number;
//   social_needs: number;
//   stranger_friendly: number;
//   vocalisation: number;
//   experimental: number;
//   hairless: number;
//   natural: number;
//   rare: number;
//   rex: number;
//   suppressed_tail: number;
//   short_legs: number;
//   wikipedia_url: string;
//   hypoallergenic: number;
//   reference_image_id: string;
// }

export interface Cat {
  name: string;
  id: string;
  catGroup: string;
  weight: string;
  weightType: string;
}

// export interface Weight {
//   imperial: string;
//   metric: string;
// }

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
