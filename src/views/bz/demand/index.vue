<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="模块ID" prop="modelId">
              <el-input v-model="queryParams.modelId" placeholder="请输入模块ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="需求名称" prop="demandName">
              <el-input v-model="queryParams.demandName" placeholder="请输入需求名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="需求文件" prop="demandWord">
              <el-input v-model="queryParams.demandWord" placeholder="请输入需求文件" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['bz:demand:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['bz:demand:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['bz:demand:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['bz:demand:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="demandList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="需求ID" align="center" prop="demandId" v-if="true" />
        <el-table-column label="模块ID" align="center" prop="modelId" />
        <el-table-column label="需求名称" align="center" prop="demandName" />
        <el-table-column label="需求内容" align="center" prop="demandContent" />
        <el-table-column label="需求文件" align="center" prop="demandWord" />
        <el-table-column label="需求类型" align="center" prop="demandType" />
        <el-table-column label="需求状态" align="center" prop="demandStatus" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['bz:demand:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['bz:demand:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改需求信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <el-form ref="demandFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模块ID" prop="modelId">
          <el-input v-model="form.modelId" placeholder="请输入模块ID" />
        </el-form-item>
        <el-form-item label="需求名称" prop="demandName">
          <el-input v-model="form.demandName" placeholder="请输入需求名称" />
        </el-form-item>
        <el-form-item label="需求内容">
          <editor v-model="form.demandContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="需求文件" prop="demandWord">
          <el-input v-model="form.demandWord" placeholder="请输入需求文件" />
        </el-form-item>
        <el-form-item label="需求状态" prop="demandStatus">
          <el-input v-model="form.demandStatus" placeholder="请输入需求状态" />
        </el-form-item>
        <el-form-item label="需求类型" prop="demandType">
          <el-input v-model="form.demandType" placeholder="请输入需求类型" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Demand" lang="ts">
import { listDemand, getDemand, delDemand, addDemand, updateDemand } from '@/api/bz/demand';
import { DemandVO, DemandQuery, DemandForm } from '@/api/bz/demand/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const demandList = ref<DemandVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const demandFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DemandForm = {
  demandId: undefined,
  modelId: undefined,
  demandName: undefined,
  demandContent: undefined,
  demandWord: undefined,
  demandType: undefined,
  remark: undefined,
  demandStatus: undefined
}
const data = reactive<PageData<DemandForm, DemandQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    modelId: undefined,
    demandName: undefined,
    demandContent: undefined,
    demandWord: undefined,
    demandType: undefined,
    demandStatus: undefined,
    params: {
    }
  },
  rules: {
    demandId: [
      { required: true, message: "需求ID不能为空", trigger: "blur" }
    ],
    modelId: [
      { required: true, message: "模块ID不能为空", trigger: "blur" }
    ],
    demandName: [
      { required: true, message: "需求名称不能为空", trigger: "blur" }
    ],
    demandContent: [
      { required: true, message: "需求内容不能为空", trigger: "blur" }
    ],
    demandWord: [
      { required: true, message: "需求文件不能为空", trigger: "blur" }
    ],
    demandType: [
      { required: true, message: "需求类型不能为空", trigger: "change" }
    ],
    remark: [
      { required: true, message: "备注不能为空", trigger: "blur" }
    ],
    demandStatus: [
      { required: true, message: "需求状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询需求信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDemand(queryParams.value);
  demandList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  demandFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: DemandVO[]) => {
  ids.value = selection.map(item => item.demandId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加需求信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: DemandVO) => {
  reset();
  const _demandId = row?.demandId || ids.value[0]
  const res = await getDemand(_demandId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改需求信息";
}

/** 提交按钮 */
const submitForm = () => {
  demandFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.demandId) {
        await updateDemand(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addDemand(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: DemandVO) => {
  const _demandIds = row?.demandId || ids.value;
  await proxy?.$modal.confirm('是否确认删除需求信息编号为"' + _demandIds + '"的数据项？').finally(() => loading.value = false);
  await delDemand(_demandIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('bz/demand/export', {
    ...queryParams.value
  }, `demand_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
