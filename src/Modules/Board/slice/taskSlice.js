import { createSlice } from '@reduxjs/toolkit';
import thunk from '../../../app/apis/helper/thunk';
import projectAPIs from '../../../app/apis/projectAPIs/projectAPIs';
import taskAPIs from '../../../app/apis/taskAPIs/taskAPIs';

const {
  createTask,
  assignUserTask,
  updateFullTask,
  getTaskDetail,
  deleteTask,
} = taskAPIs;
const { getProjectDetail } = projectAPIs;

const initialState = {
  data: null,
  isLoading: false,
  error: '',
};

export const getProjectDetailTaskThunk = thunk.request(
  'task/getProjectDetailTask',
  getProjectDetail
);
export const getTaskDetailThunk = thunk.request(
  'task/getTaskDetail',
  getTaskDetail
);
export const updateFullTaskThunk = thunk.request(
  'task/updateTask',
  updateFullTask
);
export const deleteTaskThunk = thunk.request('task/deleteTask', deleteTask);

export const createTaskThunk = thunk.request('task/createTask', createTask);

export const assignUserTaskThunk = thunk.request(
  'task/assignUserTask',
  assignUserTask
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    resetProjectDetailHandler: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjectDetailTaskThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectDetailTaskThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.data = payload;
      })
      .addCase(getProjectDetailTaskThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export const { resetProjectDetailHandler } = taskSlice.actions;
export default taskSlice.reducer;
