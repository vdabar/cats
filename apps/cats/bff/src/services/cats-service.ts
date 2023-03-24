import { DeleteCatDto, GetCatDto, SearchCatDto, GetCatResponseDto, AddCatDto } from '@cats/cats/types';
import {
  addCat,
  deleteCat,
  getAllCats,
  getCatById,
  getCatsByName,
} from '../dynamoDb';

export async function postCat(cat: AddCatDto): Promise<{ message: string }> {
  await addCat(cat);
  return { message: 'Cat added' };
}

export async function handleGetCats({ id, name }: GetCatDto): Promise<GetCatResponseDto[]> {
  let result;
  if (id) {
    result = await getCatById(id);
  } else if (name) {
    result = await getCatsByName(name);
  } else {
    result = await getAllCats();
  }
  return result;
}

export async function handleSearchCats({
  name,
  page,
  pageSize,
  sortField,
  sort,
}: SearchCatDto): Promise<GetCatResponseDto[]> {
  let cats = name ? await getCatsByName(name) : await getAllCats();
  if (page && pageSize) {
    const pageNumber = Number(page);
    const pageSizeNumber = Number(pageSize);
    cats = cats.slice(
      pageNumber * pageSizeNumber,
      (pageNumber + 1) * pageSizeNumber
    );
  }
  if (sort === 'asc') {
    cats.sort((a, b) => a[sortField].localeCompare(b[sortField]));
  } else if (sort === 'desc') {
    cats.sort((a, b) => b[sortField].localeCompare(a[sortField]));
  }
  return cats;
}

export async function handleDeleteCat({
  id,
}: DeleteCatDto): Promise<{ message: string }> {
  await deleteCat(id);
  return { message: 'Cat deleted' };
}
