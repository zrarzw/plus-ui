export interface ProjectVO {
  /**
   * 项目信息主键
   */
  pjBaseId: string | number;

  /**
   * 项目名称
   */
  pjName: string;

  /**
   * 项目状态
   */
  pjStatus: string;

  /**
   * 项目负责人
   */
  pjLeader: string;

  /**
   * 修改部门
   */
  updateDept: number;

}

export interface ProjectForm extends BaseEntity {
  /**
   * 项目信息主键
   */
  pjBaseId?: string | number;

  /**
   * 项目名称
   */
  pjName?: string;

  /**
   * 项目状态
   */
  pjStatus?: string;

  /**
   * 项目负责人
   */
  pjLeader?: string;

  /**
   * 修改部门
   */
  updateDept?: number;

}

export interface ProjectQuery extends PageQuery {

  /**
   * 项目信息主键
   */
  pjBaseId?: string | number;

  /**
   * 项目名称
   */
  pjName?: string;

  /**
   * 项目状态
   */
  pjStatus?: string;

  /**
   * 项目负责人
   */
  pjLeader?: string;

  /**
   * 修改部门
   */
  updateDept?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



