
const BASE_URL = "https://api.github.com";
const SORT_VALUE = "stars";
const ORDER = "desc";
const PER_PAGE = 10;

const urlSearcRoot = `${BASE_URL}/search/repositories`;
const urlFilters = `&sort=${SORT_VALUE}&order=${ORDER}&per_page=${PER_PAGE}`;

export interface Items {
  id: number,
  name: string
}

interface ResponseItems {
  items: Items[]
}

interface RequestOptions {
  signal?: AbortSignal;
}

let controller = new AbortController();

export const makeRequest = async (searchRequest: string, options: RequestOptions = {}): Promise<Items[] | undefined> => {
  try {
    controller.abort();
    const newController = new AbortController();
    controller = newController;

    const response = await fetch(`${urlSearcRoot}?q=${searchRequest}+in:name${urlFilters}`, {
      ...options,
      signal: newController.signal
    });

    if (response.status === 403) throw new Error(response?.statusText || "API rate limit exceeded");

    const data: ResponseItems = await response.json();

    return data?.items.map(({ id, name }) => ({ id, name }));
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Ignore cancelation errors
      return
    }
    throw error;
  }
};

export const cancelRequest = (controller: AbortController) => controller.abort();
