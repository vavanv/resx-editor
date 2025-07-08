import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import { XMLParser } from "fast-xml-parser";

interface ResxEntry {
  "@_name": string;
  value: string;
  comment?: string;
}

// Not used in the current implementation, but kept for future use
// interface ResxData {
//   root: {
//     data: ResxEntry[];
//   };
// }

declare global {
  interface Window {
    electronAPI: {
      openFileDialog: () => Promise<string | null>;
      readFile: (
        path: string
      ) => Promise<{ success: boolean; data?: string; error?: string }>;
      writeFile: (
        path: string,
        content: string
      ) => Promise<{ success: boolean; error?: string }>;
    };
  }
}

const RESX_TEMPLATE = `<?xml version="1.0" encoding="utf-8"?>
<root>
  <xsd:schema id="root" xmlns="" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata">
    <xsd:import namespace="http://www.w3.org/XML/1998/namespace" />
    <xsd:element name="root" msdata:IsDataSet="true">
      <xsd:complexType>
        <xsd:choice maxOccurs="unbounded">
          <xsd:element name="data">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name="value" type="xsd:string" minOccurs="0" msdata:Ordinal="1" />
                <xsd:element name="comment" type="xsd:string" minOccurs="0" />
              </xsd:sequence>
              <xsd:attribute name="name" type="xsd:string" use="required" />
              <xsd:attribute name="type" type="xsd:string" />
              <xsd:attribute name="mimetype" type="xsd:string" />
            </xsd:complexType>
          </xsd:element>
        </xsd:complexType>
      </xsd:element>
    </xsd:element>
  </xsd:schema>
  <resheader name="resmimetype">
    <value>text/microsoft-resx</value>
  </resheader>
  <resheader name="version">
    <value>2.0</value>
  </resheader>
  <resheader name="reader">
    <value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
  </resheader>
  <resheader name="writer">
    <value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>
  </resheader>
</root>`;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => name === "data",
});

function App() {
  const [entries, setEntries] = useState<ResxEntry[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editingEntry, setEditingEntry] = useState<{
    index: number;
    entry: ResxEntry;
  } | null>(null);

  const showMessage = (message: string, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const loadResxFile = async (filePath: string) => {
    try {
      setIsLoading(true);
      const result = await window.electronAPI.readFile(filePath);

      if (result.success && result.data) {
        const parsed = parser.parse(result.data);
        setEntries(parsed.root.data || []);
        setCurrentFile(filePath);
        showMessage("File loaded successfully");
      } else {
        throw new Error(result.error || "Failed to load file");
      }
    } catch (error: any) {
      console.error("Error loading file:", error);
      showMessage(`Error: ${error?.message || "Unknown error"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFile = async () => {
    try {
      const filePath = await window.electronAPI.openFileDialog();
      if (filePath) {
        await loadResxFile(filePath);
      }
    } catch (error: any) {
      console.error("Error opening file:", error);
      showMessage(`Error: ${error?.message || "Unknown error"}`, "error");
    }
  };

  const handleSaveFile = async () => {
    if (!currentFile) return;

    try {
      setIsLoading(true);
      const result = await window.electronAPI.writeFile(
        currentFile,
        buildResxContent(entries)
      );

      if (result.success) {
        showMessage("File saved successfully");
      } else {
        throw new Error(result.error || "Failed to save file");
      }
    } catch (error: any) {
      console.error("Error saving file:", error);
      showMessage(`Error: ${error?.message || "Unknown error"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const buildResxContent = (data: ResxEntry[]): string => {
    const entriesXml = data
      .map((entry) => {
        const comment = entry.comment
          ? `\n    <comment>${escapeXml(entry.comment)}</comment>`
          : "";
        return `  <data name="${escapeXml(
          entry["@_name"]
        )}" xml:space="preserve">\n    <value>${escapeXml(
          entry.value
        )}</value>${comment}\n  </data>`;
      })
      .join("\n");

    return RESX_TEMPLATE.replace("</root>", `${entriesXml}\n</root>`);
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const handleAddEntry = () => {
    setEditingEntry({
      index: -1,
      entry: { "@_name": "", value: "", comment: "" },
    });
  };

  const handleEditEntry = (index: number) => {
    setEditingEntry({ index, entry: { ...entries[index] } });
  };

  const handleDeleteEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
    showMessage("Entry deleted");
  };

  const handleSaveEntry = () => {
    if (!editingEntry) return;

    const newEntries = [...entries];
    if (editingEntry.index >= 0 && editingEntry.index < newEntries.length) {
      newEntries[editingEntry.index] = editingEntry.entry;
    } else {
      newEntries.push(editingEntry.entry);
    }

    setEntries(newEntries);
    setEditingEntry(null);
    showMessage("Entry saved");
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        width: 200,
        editable: false,
      },
      {
        field: "value",
        headerName: "Value",
        width: 400,
        editable: false,
        renderCell: (params) => (
          <Box
            sx={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: 1.2,
              py: 1,
            }}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: "comment",
        headerName: "Comment",
        width: 300,
        editable: false,
        renderCell: (params) => (
          <Box
            sx={{
              whiteSpace: "normal",
              wordWrap: "break-word",
              lineHeight: 1.2,
              py: 1,
            }}
          >
            {params.value || "-"}
          </Box>
        ),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        cellClassName: "actions",
        getActions: ({ id }) => {
          const index = Number(id);
          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => handleEditEntry(index)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteEntry(index)}
              color="inherit"
            />,
          ];
        },
      },
    ],
    [handleEditEntry, handleDeleteEntry]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="sticky" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RESX Editor{" "}
            {currentFile ? `- ${currentFile.split("\\").pop()}` : ""}
          </Typography>
          <Button
            color="inherit"
            startIcon={<FolderOpenIcon />}
            onClick={handleOpenFile}
            disabled={isLoading}
          >
            Open
          </Button>
          <Button
            color="inherit"
            startIcon={<SaveIcon />}
            onClick={handleSaveFile}
            disabled={!currentFile || isLoading}
          >
            Save
          </Button>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={handleAddEntry}
            disabled={!currentFile || isLoading}
          >
            Add Entry
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: "hidden", p: 2 }}>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : entries.length > 0 ? (
          <Box sx={{ height: "100%", width: "100%" }}>
            <DataGrid
              rows={entries.map((entry, index) => ({
                id: index,
                name: entry["@_name"],
                value: entry.value,
                comment: entry.comment || "",
              }))}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
              }}
              pageSizeOptions={[25, 50, 100]}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  position: "sticky",
                  top: 0,
                  zIndex: 1200,
                  backgroundColor: "background.paper",
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                  maxHeight: "none !important",
                  overflow: "visible !important",
                  lineHeight: "1.2 !important",
                  alignItems: "flex-start",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                },
                "& .MuiDataGrid-row": {
                  maxHeight: "none !important",
                },
                "& .MuiDataGrid-renderingZone": {
                  maxHeight: "none !important",
                },
              }}
            />
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="h6" color="textSecondary">
              {currentFile
                ? "No entries found"
                : "Open a RESX file to get started"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Edit Entry Dialog */}
      <Dialog
        open={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {(editingEntry?.index ?? -1) >= 0 ? "Edit Entry" : "Add Entry"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={editingEntry?.entry["@_name"] || ""}
              onChange={(e) =>
                setEditingEntry((prev) =>
                  prev
                    ? {
                        ...prev,
                        entry: { ...prev.entry, "@_name": e.target.value },
                      }
                    : null
                )
              }
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={4}
              label="Value"
              value={editingEntry?.entry.value || ""}
              onChange={(e) =>
                setEditingEntry((prev) =>
                  prev
                    ? {
                        ...prev,
                        entry: { ...prev.entry, value: e.target.value },
                      }
                    : null
                )
              }
            />
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={2}
              label="Comment"
              value={editingEntry?.entry.comment || ""}
              onChange={(e) =>
                setEditingEntry((prev) =>
                  prev
                    ? {
                        ...prev,
                        entry: { ...prev.entry, comment: e.target.value },
                      }
                    : null
                )
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingEntry(null)}>Cancel</Button>
          <Button
            onClick={handleSaveEntry}
            variant="contained"
            disabled={
              !editingEntry?.entry["@_name"] || !editingEntry?.entry.value
            }
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity as any}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
