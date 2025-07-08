import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { Add, Cancel, Download, Save } from '@mui/icons-material';

interface AddEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: { name: string; value: string; comment: string }) => void;
  existingNames: string[];
  onSaveAndDownload?: () => void;
}

export const AddEntryDialog: React.FC<AddEntryDialogProps> = ({
  open,
  onClose,
  onAdd,
  existingNames,
  onSaveAndDownload,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    comment: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    value: '',
  });

  const handleClose = () => {
    setFormData({ name: '', value: '', comment: '' });
    setErrors({ name: '', value: '' });
    onClose();
  };

  const validateName = (name: string) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (existingNames.includes(name.trim())) {
      return 'Name already exists. Names must be unique.';
    }
    return '';
  };

  const validateValue = (value: string) => {
    if (!value.trim()) {
      return 'Value is required';
    }
    return '';
  };

  const validateForm = () => {
    const nameError = validateName(formData.name);
    const valueError = validateValue(formData.value);

    setErrors({
      name: nameError,
      value: valueError,
    });

    return !nameError && !valueError;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd({
        name: formData.name.trim(),
        value: formData.value.trim(),
        comment: formData.comment.trim(),
      });
      handleClose();
    }
  };

  const handleSaveAndDownload = () => {
    if (validateForm()) {
      onAdd({
        name: formData.name.trim(),
        value: formData.value.trim(),
        comment: formData.comment.trim(),
      });
      // Trigger download after adding
      setTimeout(() => {
        onSaveAndDownload?.();
      }, 100);
      handleClose();
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: newValue,
      }));

      // Real-time validation for name field
      if (field === 'name') {
        const nameError = validateName(newValue);
        setErrors(prev => ({
          ...prev,
          name: nameError,
        }));
      }

      // Real-time validation for value field
      if (field === 'value') {
        const valueError = validateValue(newValue);
        setErrors(prev => ({
          ...prev,
          value: valueError,
        }));
      }
    };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSubmit();
    }
  };

  // Check if form is valid for button state
  const isFormValid =
    formData.name.trim() && formData.value.trim() && !errors.name && !errors.value;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Add />
        Add New Entry
      </DialogTitle>

      <DialogContent sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 3,
              fontSize: '1.1rem',
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Fill in the details for the new resource entry. Name and Value are required fields.
          </Typography>

          <TextField
            label="Name"
            value={formData.name}
            onChange={handleInputChange('name')}
            onKeyPress={handleKeyPress}
            error={!!errors.name}
            helperText={
              errors.name || 'Unique identifier for the resource (must be unique in this file)'
            }
            fullWidth
            required
            autoFocus
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-error': {
                  '& fieldset': {
                    borderColor: 'error.main',
                  },
                },
              },
            }}
          />

          <TextField
            label="Value"
            value={formData.value}
            onChange={handleInputChange('value')}
            onKeyPress={handleKeyPress}
            error={!!errors.value}
            helperText={errors.value || 'The actual content/text of the resource'}
            fullWidth
            required
            multiline
            rows={4}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-error': {
                  '& fieldset': {
                    borderColor: 'error.main',
                  },
                },
              },
            }}
          />

          <TextField
            label="Comment"
            value={formData.comment}
            onChange={handleInputChange('comment')}
            onKeyPress={handleKeyPress}
            helperText="Optional description or notes about this resource"
            fullWidth
            multiline
            rows={1}
            variant="outlined"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button onClick={handleClose} startIcon={<Cancel />} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleSubmit}
            startIcon={<Add />}
            variant="outlined"
            color="primary"
            disabled={!isFormValid}
          >
            Add Entry
          </Button>
          {onSaveAndDownload && (
            <Button
              onClick={handleSaveAndDownload}
              startIcon={<Save />}
              variant="contained"
              color="primary"
              disabled={!isFormValid}
              sx={{ minWidth: 160 }}
            >
              Add & Download
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
