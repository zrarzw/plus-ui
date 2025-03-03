<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="项目名称" prop="pjName">
              <el-input v-model="queryParams.pjName" placeholder="请输入项目名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="项目负责人" prop="pjLeader" >
              <el-input v-model="queryParams.pjLeader" placeholder="请输入项目负责人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="修改部门" prop="updateDept">
              <el-input v-model="queryParams.updateDept" placeholder="请输入修改部门" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['bz:project:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['bz:project:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['bz:project:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['bz:project:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="项目信息主键" align="center" prop="pjBaseId" />
        <el-table-column label="项目名称" align="center" prop="pjName" />
        <el-table-column label="项目状态" align="center" prop="pjStatus" />
        <el-table-column label="项目负责人" align="center" prop="pjLeader" />
        <el-table-column label="修改部门" align="center" prop="updateDept" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['bz:project:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['bz:project:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改项目基本信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="projectFormRef" :model="form" :rules="rules" label-width="80px">
   
        <el-form-item label="项目名称" prop="pjName">
          <el-input v-model="form.pjName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目负责人" prop="pjLeader">
          <el-input v-model="form.pjLeader" placeholder="请输入项目负责人" />
        </el-form-item>
        <el-form-item label="修改部门" prop="updateDept">
          <el-input v-model="form.updateDept" placeholder="请输入修改部门" />
        </el-form-item>
        <el-form-item label="项目状态" prop="pjStatus">
          <el-input v-model="form.pjStatus" placeholder="请输入项目状态" />
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

<script setup name="Project" lang="ts">
import { listProject, getProject,delProject, addProject,updateProject } from '@/api/bz/project';
import { ProjectVO, ProjectQuery, ProjectForm } from '@/api/bz/project/types';


const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const projectList = ref<ProjectVO[]>([])
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const projectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProjectForm = {
  pjBaseId: undefined,
  pjName: undefined,
  pjStatus: undefined,
  pjLeader: undefined,
  updateDept: undefined
}
const data = reactive<PageData<ProjectForm, ProjectQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    pjBaseId: undefined,
    pjName: undefined,
    pjStatus: undefined,
    pjLeader: undefined,
    updateDept: undefined,
    params: {
    }
  },
  rules: {
    pjName: [
      { required: true, message: "项目名称不能为空", trigger: "blur" }
    ],
    pjStatus: [
      { required: true, message: "项目状态不能为空", trigger: "change" }
    ],
    pjLeader: [
      { required: true, message: "项目负责人不能为空", trigger: "blur" }
    ],
    updateDept: [
      { required: true, message: "修改部门不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目基本信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProject(queryParams.value);
  projectList.value = res.rows;
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
  projectFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProjectVO[]) => {
  ids.value = selection.map(item => item.pjBaseId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加项目基本信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ProjectVO) => {
  reset();
  const _pjBaseId = row?.pjBaseId || ids.value[0]
  const res = await getProject(_pjBaseId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改项目基本信息";
}

/** 提交按钮 */
const submitForm = () => {
  projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.pjBaseId) {
        await updateProject(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProject(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProjectVO) => {
  const _pjBaseIds = row?.pjBaseId || ids.value;
  await proxy?.$modal.confirm('是否确认删除项目基本信息编号为"' + _pjBaseIds + '"的数据项？').finally(() => loading.value = false);
  await delProject(_pjBaseIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('bz/project/export', {
    ...queryParams.value
  }, `project_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
