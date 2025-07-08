import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { FileUpload } from './components/FileUpload';
import { FileGroupTabs } from './components/FileGroupTabs';
import { FileSubTabs } from './components/FileSubTabs';
import { ResxDataGrid } from './components/ResxDataGrid';
import { DownloadButton } from './components/DownloadButton';
import { GridRow, FileTab, FileGroup } from './types/resx';
import { parseResxFile } from './utils/xmlParser';
import { groupFilesByBaseName, parseFileName } from './utils/fileGrouping';
import { downloadResxFile } from './utils/downloadUtils';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [tabs, setTabs] = useState<FileTab[]>([]);
  const [groups, setGroups] = useState<FileGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [debugDialogOpen, setDebugDialogOpen] = useState<boolean>(false);

  const generateTabId = () => `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Simple function to update groups from tabs
  const updateGroupsFromTabs = useCallback(
    (newTabs: FileTab[]) => {
      console.log('🔄 === UPDATING GROUPS ===');
      console.log(
        '📥 Input tabs for grouping:',
        newTabs.map(t => ({
          id: t.id,
          fileName: t.fileName,
          baseFileName: t.baseFileName,
          language: t.language,
        })),
      );

      const newGroups = groupFilesByBaseName(newTabs);
      console.log(
        '📊 Generated groups result:',
        newGroups.map(g => ({
          id: g.id,
          baseFileName: g.baseFileName,
          fileCount: g.files.length,
          activeFileId: g.activeFileId,
          files: g.files.map(f => ({
            fileName: f.fileName,
            language: f.language,
            id: f.id,
          })),
        })),
      );

      setGroups(newGroups);

      // Update active selections if needed
      if (newGroups.length === 0) {
        console.log('❌ No groups, clearing active selections');
        setActiveGroupId(null);
        setActiveFileId(null);
      } else if (!activeGroupId || !newGroups.find(g => g.id === activeGroupId)) {
        // If no active group or current group doesn't exist, set first group as active
        const firstGroup = newGroups[0];
        console.log('🎯 Setting active group to:', firstGroup.id);
        console.log('🎯 Setting active file to:', firstGroup.activeFileId);
        setActiveGroupId(firstGroup.id);
        setActiveFileId(firstGroup.activeFileId);
      }

      return newGroups;
    },
    [activeGroupId],
  );

  const handleUploadStart = useCallback(() => {
    console.log('🔄 === RESETTING SESSION ===');
    console.log('🗑️ Clearing all tabs, groups, and active selections...');

    setTabs([]);
    setGroups([]);
    setActiveGroupId(null);
    setActiveFileId(null);
    setError('');

    console.log('✅ Session reset completed');
  }, []);

  const handleDebugClick = useCallback(() => {
    setDebugDialogOpen(true);
  }, []);

  const handleDebugClose = useCallback(() => {
    setDebugDialogOpen(false);
  }, []);

  const handleFileUpload = useCallback((content: string, fileName: string) => {
    console.log('\n🚀 === HANDLE FILE UPLOAD ===');
    console.log('📤 Processing file:', fileName);
    console.log('📏 Content length:', content?.length || 0);

    try {
      setError('');

      console.log('🔍 Parsing RESX content...');
      const resxData = parseResxFile(content);
      console.log('📊 Parsed entries count:', resxData.entries.length);
      console.log(
        '📋 Sample entries:',
        resxData.entries.slice(0, 3).map(e => ({ name: e.name, value: e.value?.substring(0, 50) })),
      );

      const gridRows: GridRow[] = resxData.entries.map((entry, index) => ({
        id: `${entry.name}-${index}`,
        name: entry.name,
        value: entry.value,
        comment: entry.comment || '',
      }));
      console.log('🎯 Created grid rows:', gridRows.length);

      const { baseFileName, language } = parseFileName(fileName);
      console.log('📝 Filename parsing result:', {
        fileName,
        baseFileName,
        language,
      });

      const newTab: FileTab = {
        id: generateTabId(),
        fileName,
        originalFileName: fileName,
        rows: gridRows,
        hasChanges: false,
        baseFileName,
        language,
      };

      console.log('🔍 New tab baseFileName and language:', {
        baseFileName: newTab.baseFileName,
        language: newTab.language,
      });

      console.log('✅ Created new tab:', {
        id: newTab.id,
        fileName: newTab.fileName,
        baseFileName: newTab.baseFileName,
        language: newTab.language,
        rowCount: newTab.rows.length,
      });

      // Use functional update to avoid race conditions with multiple file uploads
      setTabs(prevTabs => {
        console.log(
          '📋 Current tabs before addition:',
          prevTabs.map(t => ({
            fileName: t.fileName,
            baseFileName: t.baseFileName,
            language: t.language,
          })),
        );

        const newTabs = [...prevTabs, newTab];
        console.log(
          '📋 All tabs after addition:',
          newTabs.map(t => ({
            id: t.id,
            fileName: t.fileName,
            baseFileName: t.baseFileName,
            language: t.language,
          })),
        );

        // Update groups and set active selections
        setTimeout(() => {
          const newGroups = groupFilesByBaseName(newTabs);
          setGroups(newGroups);

          // Set this as active if it's the first file or if no active group
          setActiveGroupId(currentActiveGroupId => {
            if (!currentActiveGroupId) {
              const targetGroup = newGroups.find(g => g.baseFileName === baseFileName);
              if (targetGroup) {
                console.log('🎯 Setting active group and file:', targetGroup.id, newTab.id);
                setActiveFileId(newTab.id);
                return targetGroup.id;
              }
            }
            return currentActiveGroupId;
          });
        }, 0);

        return newTabs;
      });

      console.log('✅ File upload completed successfully');
    } catch (err) {
      const errorMessage = `Error parsing ${fileName}. Please ensure it's a valid .resx file.`;
      setError(errorMessage);
      console.error('❌ Parse error:', err);
      console.error('❌ Error details:', {
        fileName,
        contentLength: content?.length,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  const handleGroupChange = useCallback(
    (groupId: string) => {
      console.log('🔄 Group changed to:', groupId);
      setActiveGroupId(groupId);
      const group = groups.find(g => g.id === groupId);
      if (group && group.files.length > 0) {
        const fileId = group.activeFileId || group.files[0].id;
        console.log('📁 Setting active file to:', fileId);
        setActiveFileId(fileId);
      }
    },
    [groups],
  );

  const handleFileChange = useCallback((fileId: string) => {
    console.log('📄 File changed to:', fileId);
    setActiveFileId(fileId);

    // Update the active file in the group
    setGroups(prevGroups =>
      prevGroups.map(group => {
        const fileInGroup = group.files.find(f => f.id === fileId);
        if (fileInGroup) {
          console.log('🔄 Updating active file in group:', group.id, 'to:', fileId);
          return { ...group, activeFileId: fileId };
        }
        return group;
      }),
    );
  }, []);

  const handleRowsChange = useCallback(
    (newRows: GridRow[]) => {
      if (!activeFileId) return;

      setTabs(prevTabs => {
        const updatedTabs = prevTabs.map(tab => {
          if (tab.id === activeFileId) {
            // Check if there are actual changes by comparing with original
            const hasChanges = JSON.stringify(newRows) !== JSON.stringify(tab.rows);
            return {
              ...tab,
              rows: newRows,
              hasChanges,
            };
          }
          return tab;
        });

        // Update groups to reflect changes using the updated tabs
        setTimeout(() => {
          updateGroupsFromTabs(updatedTabs);
        }, 0);

        return updatedTabs;
      });
    },
    [activeFileId, updateGroupsFromTabs],
  );

  const activeGroup = groups.find(group => group.id === activeGroupId);
  const activeFile = activeGroup?.files.find(file => file.id === activeFileId);

  const handleDownloadCurrentFile = useCallback(() => {
    if (activeFile) {
      downloadResxFile(activeFile.rows, activeFile.originalFileName);
    }
  }, [activeFile]);

  console.log('📊 === CURRENT APP STATE ===');
  console.log('📈 Summary:', {
    tabsCount: tabs.length,
    groupsCount: groups.length,
    activeGroupId,
    activeFileId,
    activeGroup: activeGroup?.baseFileName,
    activeFile: activeFile?.fileName,
  });
  console.log(
    '📁 All loaded files:',
    tabs.map(t => ({
      fileName: t.fileName,
      baseFileName: t.baseFileName,
      language: t.language,
      id: t.id,
    })),
  );
  console.log(
    '🗂️ All groups:',
    groups.map(g => ({
      id: g.id,
      baseFileName: g.baseFileName,
      fileCount: g.files.length,
      activeFileId: g.activeFileId,
      files: g.files.map(f => ({ fileName: f.fileName, id: f.id })),
    })),
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Compact Header */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            align="center"
            sx={{
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 0.5,
              fontWeight: 600,
            }}
          >
            Multi-File RESX Editor
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.95rem',
            }}
          >
            Upload, edit, and manage multiple .NET resource files with language grouping
          </Typography>
        </Paper>

        {/* Compact Upload Section */}
        <Box sx={{ mb: 2 }}>
          <FileUpload
            onFileUpload={handleFileUpload}
            onUploadStart={handleUploadStart}
            onDebugClick={handleDebugClick}
            uploadedFileCount={tabs.length}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* File Group Tabs */}
        <FileGroupTabs
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupChange={handleGroupChange}
        />

        {/* File Sub Tabs (only shown if group has multiple files) */}
        {activeGroup && (
          <FileSubTabs
            files={activeGroup.files}
            activeFileId={activeFileId}
            onFileChange={handleFileChange}
          />
        )}

        {/* Expanded Data Grid Area */}
        <Box sx={{ mb: 2 }}>
          <ResxDataGrid
            rows={activeFile?.rows || []}
            onRowsChange={handleRowsChange}
            fileName={activeFile?.fileName}
            onDownload={handleDownloadCurrentFile}
          />
        </Box>

        {activeFile && (
          <DownloadButton
            rows={activeFile.rows}
            fileName={activeFile.originalFileName}
            disabled={activeFile.rows.length === 0}
          />
        )}

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Built with React, TypeScript, and Material UI • File grouping enabled
          </Typography>
        </Box>

        {/* Debug Dialog */}
        <Dialog open={debugDialogOpen} onClose={handleDebugClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Debug Information</Typography>
              <IconButton onClick={handleDebugClose} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace' }}>
                <strong>📊 Application State:</strong>
                <br />
                📁 {tabs.length} files loaded, {groups.length} groups created
                <br />
                🎯 Active: {activeGroup?.baseFileName || 'none'} / {activeFile?.fileName || 'none'}
                <br />
                <br />
                <strong>📋 Loaded Files:</strong>
                <br />
                {tabs.length > 0
                  ? tabs.map((t, index) => (
                      <span key={t.id}>
                        {index + 1}. {t.fileName} (base: {t.baseFileName}, lang: {t.language})
                        <br />
                      </span>
                    ))
                  : 'No files loaded'}
                <br />
                <strong>🗂️ File Groups:</strong>
                <br />
                {groups.length > 0
                  ? groups.map((g, index) => (
                      <span key={g.id}>
                        {index + 1}. {g.baseFileName} ({g.files.length} files)
                        <br />
                        {g.files.map((f, fIndex) => (
                          <span key={f.id} style={{ marginLeft: '20px' }}>
                            {fIndex + 1}.{fIndex + 1} {f.fileName} ({f.language})
                            {f.id === g.activeFileId && ' ← active'}
                            <br />
                          </span>
                        ))}
                        <br />
                      </span>
                    ))
                  : 'No groups created'}
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDebugClose} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
