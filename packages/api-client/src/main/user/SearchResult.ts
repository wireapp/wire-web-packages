import {Contact} from '../user';

interface SearchResult {
  documents: Contact[];
  found: number;
  returned: number;
  took: number;
}

export default SearchResult;
