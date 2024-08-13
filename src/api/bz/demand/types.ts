export interface DemandVO {
  /**
   * 需求ID
   */
  demandId: string | number;

  /**
   * 模块ID
   */
  modelId: string | number;

  /**
   * 需求名称
   */
  demandName: string;

  /**
   * 需求内容
   */
  demandContent: string;

  /**
   * 需求文件
   */
  demandWord: string;

  /**
   * 需求类型
   */
  demandType: string;

  /**
   * 需求状态
   */
  demandStatus: string;

}

export interface DemandForm extends BaseEntity {
  /**
   * 需求ID
   */
  demandId?: string | number;

  /**
   * 模块ID
   */
  modelId?: string | number;

  /**
   * 需求名称
   */
  demandName?: string;

  /**
   * 需求内容
   */
  demandContent?: string;

  /**
   * 需求文件
   */
  demandWord?: string;

  /**
   * 需求类型
   */
  demandType?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 需求状态
   */
  demandStatus?: string;

}

export interface DemandQuery extends PageQuery {

  /**
   * 模块ID
   */
  modelId?: string | number;

  /**
   * 需求名称
   */
  demandName?: string;

  /**
   * 需求内容
   */
  demandContent?: string;

  /**
   * 需求文件
   */
  demandWord?: string;

  /**
   * 需求类型
   */
  demandType?: string;

  /**
   * 需求状态
   */
  demandStatus?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



