import React, { useRef } from 'react';
import { Button, Box, Typography, Paper, Chip } from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

interface FileUploadProps {
  onFileUpload: (content: string, fileName: string) => void;
  onUploadStart: () => void;
  uploadedFileCount: number;
  onDebugClick: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onUploadStart,
  uploadedFileCount,
  onDebugClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log('🚀 === FILE UPLOAD STARTED ===');
    console.log('📁 Total files selected:', files?.length || 0);

    if (files && files.length > 0) {
      // Reset previous session data before processing new files
      console.log('🔄 Resetting previous session data...');
      onUploadStart();

      console.log('📋 Selected files:');
      Array.from(files).forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.size} bytes, type: ${file.type})`);
      });

      Array.from(files).forEach((file, index) => {
        console.log(`\n📤 Processing file ${index + 1}/${files.length}: ${file.name}`);

        if (file.name.endsWith('.resx')) {
          console.log('✅ Valid .resx file, reading content...');
          const reader = new FileReader();

          reader.onload = e => {
            console.log(`📖 File content loaded for: ${file.name}`);
            const content = e.target?.result as string;
            console.log(`📏 Content length: ${content?.length || 0} characters`);
            console.log(`🔤 Content preview: ${content?.substring(0, 200)}...`);

            try {
              console.log(`🎯 Calling onFileUpload for: ${file.name}`);
              onFileUpload(content, file.name);
              console.log(`✅ Successfully processed: ${file.name}`);
            } catch (error) {
              console.error(`❌ Error processing ${file.name}:`, error);
            }
          };

          reader.onerror = error => {
            console.error(`❌ FileReader error for ${file.name}:`, error);
          };

          reader.readAsText(file);
        } else {
          console.log(`❌ Invalid file type: ${file.name} (not .resx)`);
          alert(`${file.name} is not a valid .resx file`);
        }
      });
    } else {
      console.log('❌ No files selected');
    }

    // Reset the input to allow uploading the same file again
    event.target.value = '';
    console.log('🔄 File input reset');
  };

  const handleButtonClick = () => {
    console.log('🖱️ Upload button clicked');
    fileInputRef.current?.click();
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 500 }}>
            Upload Files
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept=".resx"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={handleButtonClick}
            size="medium"
          >
            Select .resx Files
          </Button>

          <Button
            variant="contained"
            onClick={onUploadStart}
            size="medium"
            sx={{
              backgroundColor: '#dc2626',
              '&:hover': {
                backgroundColor: '#b91c1c',
              },
            }}
          >
            Clear selection
          </Button>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {uploadedFileCount > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Description color="success" fontSize="small" />
              <Chip
                label={`${uploadedFileCount} file${uploadedFileCount > 1 ? 's' : ''} loaded`}
                color="success"
                variant="outlined"
                size="small"
                onClick={onDebugClick}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Multiple files supported
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
