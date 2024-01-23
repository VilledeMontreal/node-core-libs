/**
 * Represents a paginated result set. This follows the doc :
 * https://villemontreal.atlassian.net/wiki/display/AES/REST+API#RESTAPI-Pagination.1
 */
export interface IPaginatedResult<T> {
  paging: {
    offset: number;
    limit: number;
    totalCount: number;
  };
  items: T[];
}

/**
 * IPaginatedResult Type Guard
 */
export const isPaginatedResult = (obj: any): obj is IPaginatedResult<any> => {
  return (
    obj &&
    'paging' in obj &&
    'offset' in obj.paging &&
    'limit' in obj.paging &&
    'totalCount' in obj.paging &&
    'items' in obj
  );
};
