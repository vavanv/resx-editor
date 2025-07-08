import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

interface EditEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: { id: string; value: string; comment: string }) => void;
  entry: {
    id: string;
    name: string;
    value: string;
    comment?: string;
  } | null;
  onSaveAndDownload?: () => void;
}

export const EditEntryDialog: React.FC<EditEntryDialogProps> = ({
  open,
  onClose,
  onSave,
  entry,
  onSaveAndDownload,
}) => {
  const [formData, setFormData] = useState({
    value: '',
    comment: '',
  });
  const [errors, setErrors] = useState({
    value: '',
  });

  // Update form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        value: entry.value,
        comment: entry.comment || '',
      });
      setErrors({ value: '' });
    }
  }, [entry]);

  const handleClose = () => {
    setErrors({ value: '' });
    onClose();
  };

  const validateValue = (value: string) => {
    if (!value.trim()) {
      return 'Value is required';
    }
    return '';
  };

  const validateForm = () => {
    const valueError = validateValue(formData.value);

    setErrors({
      value: valueError,
    });

    return !valueError;
  };

  const handleSubmit = () => {
    if (validateForm() && entry) {
      onSave({
        id: entry.id,
        value: formData.value.trim(),
        comment: formData.comment.trim(),
      });
      handleClose();
    }
  };

  const handleSaveAndDownload = () => {
    if (validateForm() && entry) {
      onSave({
        id: entry.id,
        value: formData.value.trim(),
        comment: formData.comment.trim(),
      });
      // Trigger download after saving
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
  const isFormValid = formData.value.trim() && !errors.value;
  const hasChanges =
    entry && (formData.value !== entry.value || formData.comment !== (entry.comment || ''));

  if (!entry) return null;

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
        <Edit />
        Edit Entry
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
            Edit the value and comment for this resource entry. The name cannot be changed.
          </Typography>

          <TextField
            label="Name"
            value={entry.name}
            fullWidth
            disabled
            variant="outlined"
            helperText="Name cannot be modified"
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: 'text.primary',
                opacity: 0.7,
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
            autoFocus
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
            startIcon={<Save />}
            variant="outlined"
            color="primary"
            disabled={!isFormValid || !hasChanges}
          >
            Save Changes
          </Button>
          {onSaveAndDownload && (
            <Button
              onClick={handleSaveAndDownload}
              startIcon={<Save />}
              variant="contained"
              color="primary"
              disabled={!isFormValid || !hasChanges}
              sx={{ minWidth: 160 }}
            >
              Save & Download
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
