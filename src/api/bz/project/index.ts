import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectVO, ProjectForm, ProjectQuery } from '@/api/bz/project/types';

/**
 * 查询项目基本信息列表
 * @param query
 * @returns {*}
 */

export const listProject = (query?: ProjectQuery): AxiosPromise<ProjectVO[]> => {
  return request({
    url: '/bz/project/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目基本信息详细
 * @param pjBaseId
 */
export const getProject = (pjBaseId: string | number): AxiosPromise<ProjectVO> => {
  return request({
    url: '/bz/project/' + pjBaseId,
    method: 'get'
  });
};

/**
 * 新增项目基本信息
 * @param data
 */
export const addProject = (data: ProjectForm) => {
  return request({
    url: '/bz/project',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目基本信息
 * @param data
 */
export const updateProject = (data: ProjectForm) => {
  return request({
    url: '/bz/project',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目基本信息
 * @param pjBaseId
 */
export const delProject = (pjBaseId: string | number | Array<string | number>) => {
  return request({
    url: '/bz/project/' + pjBaseId,
    method: 'delete'
  });
};
