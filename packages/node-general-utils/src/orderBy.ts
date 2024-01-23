import * as _ from 'lodash';

/**
 * IOrderBy represents an order specified for a search.
 * Controllers can parse a search request and use this entity
 * to type the orderBys found in its querystring.
 *
 * Note that a `httpUtils.getOrderBys(...)` utility is provided by
 * the "@villemontreal/core-http-request-nodejs-lib" library to
 * easily parse and type such orderBys from an Express request.
 *
 * @see https://confluence.montreal.ca/pages/viewpage.action?spaceKey=AES&title=REST+API#RESTAPI-Tridelarequ%C3%AAte
 */
export interface IOrderBy {
  key: string;
  direction: OrderByDirection;
}

export const isOrderBy = (obj: any): obj is IOrderBy => {
  return !_.isNil(obj) && _.isObject(obj) && !_.isArray(obj) && 'key' in obj && 'direction' in obj;
};

export const isOrderByArray = (objs: any): objs is IOrderBy[] => {
  if (!_.isArray(objs)) {
    return false;
  }
  for (const obj of objs) {
    if (!_.isNil(obj) && !isOrderBy(obj)) {
      return false;
    }
  }
  return true;
};

export enum OrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
