import React, { useState } from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Edit, Add, Delete } from '@mui/icons-material';
import { GridRow } from '../types/resx';
import { AddEntryDialog } from './AddEntryDialog';
import { EditEntryDialog } from './EditEntryDialog';

interface ResxDataGridProps {
  rows: GridRow[];
  onRowsChange: (newRows: GridRow[]) => void;
  fileName?: string;
  onDownload?: () => void;
}

export const ResxDataGrid: React.FC<ResxDataGridProps> = ({
  rows,
  onRowsChange,
  fileName,
  onDownload,
}) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GridRow | null>(null);
  const vOffSet = 540; // Adjust this value based on your layout (header, footer, etc.)

  const calcTableHeight = React.useCallback(() => window.innerHeight - vOffSet, [vOffSet]);

  const [tableHeight, setTableHeight] = React.useState<number>(calcTableHeight);

  React.useEffect(() => {
    window.onresize = () => setTableHeight(calcTableHeight);
  }, [calcTableHeight]);

  const handleEditClick = (row: GridRow) => () => {
    setEditingEntry(row);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedRows = rows.filter(row => row.id !== id);
      onRowsChange(updatedRows);
    }
  };

  const handleAddEntry = (entry: { name: string; value: string; comment: string }) => {
    const newId = `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRow: GridRow = {
      id: newId,
      name: entry.name,
      value: entry.value,
      comment: entry.comment,
    };

    // Add new entry at the beginning of the list for better visibility
    const updatedRows = [newRow, ...rows];
    onRowsChange(updatedRows);
  };

  const handleEditEntry = (editedEntry: { id: string; value: string; comment: string }) => {
    const updatedRows = rows.map(row =>
      row.id === editedEntry.id
        ? { ...row, value: editedEntry.value, comment: editedEntry.comment }
        : row,
    );
    onRowsChange(updatedRows);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.25,
      minWidth: 200,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'value',
      headerName: 'Value',
      flex: 0.45,
      minWidth: 300,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 0.25,
      minWidth: 200,
      headerClassName: 'data-grid-header',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'data-grid-header',
      cellClassName: 'actions',
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            key="edit"
            icon={<Edit />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(row)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Delete />}
            label="Delete"
            onClick={handleDeleteClick(row.id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const existingNames = rows.map(row => row.name);

  if (rows.length === 0) {
    return (
      <>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: 'center',
            minHeight: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No files selected
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {fileName
                ? `${fileName} is empty or has no valid entries`
                : 'Upload .resx files to view and edit their contents'}
            </Typography>
            {fileName && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
                size="large"
              >
                Add First Entry
              </Button>
            )}
          </Box>
        </Paper>

        <AddEntryDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAdd={handleAddEntry}
          existingNames={existingNames}
          onSaveAndDownload={onDownload}
        />
      </>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 1.5, width: '100%' }}>
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 500 }}>
            {fileName ? `${fileName}` : 'RESX File'} • {rows.length} entries
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
            size="small"
            sx={{ minWidth: 'auto' }}
          >
            Add Entry
          </Button>
        </Box>
        <div style={{ height: tableHeight, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            density="compact"
            sx={{
              border: 'none',
              width: '100%',
              '& .data-grid-header': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderRadius: 0,
              },
            }}
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        </div>
      </Paper>

      <AddEntryDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddEntry}
        existingNames={existingNames}
        onSaveAndDownload={onDownload}
      />

      <EditEntryDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditEntry}
        entry={editingEntry}
        onSaveAndDownload={onDownload}
      />
    </>
  );
};
