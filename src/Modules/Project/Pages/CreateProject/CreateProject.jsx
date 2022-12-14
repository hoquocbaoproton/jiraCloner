import React, { useEffect, useReducer, useState } from 'react';
import 'draft-js/dist/Draft.css';
import {
  Chip,
  InputLabel,
  Box,
  TextField,
  Typography,
  colors,
  alpha,
  styled,
  Alert,
  Button,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Container } from '@mui/system';
// import RichTextEditor from '../../../../UI/Modules/RichTextEditor/RichTextEditor';

import { useRequest } from '../../../../app/hooks/request/useRequest';
import projectCategory from '../../../../app/apis/projectCategory/projectCategory';
import { useForm } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { createProjectThunk } from '../../slice/projectSlice';
import { useNavigate } from 'react-router-dom';
import DialogProject from '../../Components/DialogProject/DialogProject';
import LexicalEditor from '../../../../UI/Modules/LexicalEditor/LexicalEditor';

//
const { getProjectCategory } = projectCategory;

const categoryProjectMap = {
  app: 'Dự án phần mềm',
  web: 'Dự án web',
  mobile: 'Dự án di động',
};

const CategorySelection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  gap: '8px',
  alignItems: 'center',
}));

const alertCase = {
  loading: 'ALERT_LOADING',
  error: 'ALERT_ERROR',
  success: 'ALERT_SUCCESS',
};

const initialAlertState = {
  isLoading: false,
  errorMessage: '',
  successMessage: '',
};

const alertReducer = (state, { type, payload }) => {
  switch (type) {
    case alertCase.loading:
      return {
        ...state,
        isLoading: true,
      };
    case alertCase.error:
      return {
        ...state,
        isLoading: false,
        successMessage: '',
        errorMessage: payload,
      };
    case alertCase.success:
      return {
        ...state,
        isLoading: false,
        errorMessage: '',
        successMessage: 'Create Project Successfully',
      };
    default:
      return state;
  }
};

const CreateProject = () => {
  const { data: projectCategory } = useRequest(getProjectCategory);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState(null);
  const [isDialogOpenData, setIsDialogOpenData] = useState(null);
  const [alertState, dispatchAlert] = useReducer(
    alertReducer,
    initialAlertState
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      projectName: '',
    },
  });

  const onSubmit = async ({ projectName }, e) => {
    try {
      dispatchAlert({ type: alertCase.loading });
      if (!selectedCategory) {
        dispatchAlert({
          type: alertCase.error,
          payload: "You haven't selected category",
        });
        return;
      }
      const projectInfo = {
        projectName,
        selectedCategory,
        description,
      };
      const data = await dispatch(createProjectThunk(projectInfo)).unwrap();
      dispatchAlert({
        type: alertCase.success,
      });
      setIsDialogOpenData(data.id);
      return data;
    } catch (error) {
      console.log(error);
      dispatchAlert({
        type: alertCase.error,
        payload: error,
      });
    }
  };

  const selectCategoryHandler = (id) => {
    if (selectedCategory !== id) {
      setSelectedCategory(id);
    } else {
      setSelectedCategory(null);
    }
  };

  const activeCategoryStyle = (id, theme) => {
    if (selectedCategory === id) {
      return {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.common.white,
      };
    }
  };

  const watchEditor = (html) => {
    setDescription(html);
  };

  return (
    <>
      <DialogProject
        isDialogOpen={!!isDialogOpenData}
        actionError='Cancel'
        actionPrimary='Go'
        onControl={() => navigate(`/board/${isDialogOpenData}`)}
        onClose={() => setIsDialogOpenData(null)}
        label='Do you want to go to project?'
      />
      <Container sx={{ marginTop: '32px' }} maxWidth='sm'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant='h5' fontWeight={700}>
            Create New Project
          </Typography>
          <Grid2 sx={{ textAlign: 'left' }} container>
            <Grid2 marginTop={2} xs={12}>
              <InputLabel
                sx={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: colors.grey[900],
                }}
              >
                Project Name
              </InputLabel>
              <TextField
                size='small'
                placeholder="Input your project's name"
                {...register('projectName', {
                  required: {
                    value: true,
                    message: 'This is required',
                  },
                  pattern: {
                    value: /^[^'"!@#$%^&*()?,:;~`+=-]*$/,
                    message: 'Not contain special character',
                  },
                })}
                fullWidth
                color={errors.projectName ? 'error' : ''}
                error={!!errors.projectName}
                helperText={errors.projectName?.message}
              />
            </Grid2>
          </Grid2>
          <Grid2 marginTop={2} container>
            <Grid2 marginBottom={1} xs={12}>
              <Typography
                sx={{ display: 'block' }}
                align='left'
                variant='subtitle1'
                fontWeight={700}
              >
                Write description
              </Typography>
            </Grid2>
            <Grid2 xs={12}>
              <LexicalEditor onWatch={watchEditor} />
            </Grid2>
          </Grid2>
          <Grid2 marginTop={2} container>
            <Grid2 xs={12}>
              <Typography
                sx={{ display: 'block', marginBottom: '16px' }}
                align='left'
                variant='subtitle1'
                fontWeight={700}
              >
                Project Category
              </Typography>
              <Grid2 xs={6}>
                <CategorySelection>
                  {projectCategory?.map((item) => (
                    <Chip
                      key={item.id}
                      sx={(theme) => ({
                        color:
                          item.projectCategoryName === categoryProjectMap['app']
                            ? theme.palette.primary.light
                            : item.projectCategoryName ===
                              categoryProjectMap['web']
                            ? colors.green[500]
                            : colors.amber[500],
                        backgroundColor:
                          item.projectCategoryName === categoryProjectMap['app']
                            ? alpha(theme.palette.primary.light, 0.2)
                            : item.projectCategoryName ===
                              categoryProjectMap['web']
                            ? colors.green[50]
                            : colors.amber[50],
                        '&:hover': {
                          backgroundColor:
                            selectedCategory === item.id
                              ? theme.palette.secondary.light
                              : item.projectCategoryName ===
                                categoryProjectMap['app']
                              ? alpha(theme.palette.primary.main, 0.2)
                              : item.projectCategoryName ===
                                categoryProjectMap['web']
                              ? colors.green[100]
                              : colors.amber[100],
                        },
                        ...activeCategoryStyle(item.id, theme),
                      })}
                      onClick={() => selectCategoryHandler(item.id)}
                      label={item.projectCategoryName}
                    />
                  ))}
                </CategorySelection>
              </Grid2>
            </Grid2>
          </Grid2>
          <Grid2 justifyContent='flex-end' marginTop={4} container>
            <Button
              type='submit'
              sx={{ borderRadius: '8px' }}
              variant='contained'
              color='primary'
              disabled={alertState.isLoading}
            >
              Add Project
            </Button>
          </Grid2>
        </form>
        <Grid2 container>
          <Grid2 xs={6}>
            <Box marginTop={4}>
              {alertState.errorMessage ? (
                <Alert severity='error'>{alertState.errorMessage}</Alert>
              ) : alertState.successMessage ? (
                <Alert severity='success'>{alertState.successMessage}</Alert>
              ) : null}
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </>
  );
};

export default CreateProject;
