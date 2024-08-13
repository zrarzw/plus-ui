import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DemandVO, DemandForm, DemandQuery } from '@/api/bz/demand/types';

/**
 * 查询需求信息列表
 * @param query
 * @returns {*}
 */

export const listDemand = (query?: DemandQuery): AxiosPromise<DemandVO[]> => {
  return request({
    url: '/bz/demand/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询需求信息详细
 * @param demandId
 */
export const getDemand = (demandId: string | number): AxiosPromise<DemandVO> => {
  return request({
    url: '/bz/demand/' + demandId,
    method: 'get'
  });
};

/**
 * 新增需求信息
 * @param data
 */
export const addDemand = (data: DemandForm) => {
  return request({
    url: '/bz/demand',
    method: 'post',
    data: data
  });
};

/**
 * 修改需求信息
 * @param data
 */
export const updateDemand = (data: DemandForm) => {
  return request({
    url: '/bz/demand',
    method: 'put',
    data: data
  });
};

/**
 * 删除需求信息
 * @param demandId
 */
export const delDemand = (demandId: string | number | Array<string | number>) => {
  return request({
    url: '/bz/demand/' + demandId,
    method: 'delete'
  });
};
