import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useRef } from "react";
import EditIcon from "@mui/icons-material/Edit";

const API_URL = ` ${
  process.env.REACT_APP_API_URL || "http://localhost:8000/api"
}/footer-info/about-us`;

const FooterInfo = () => {
  const [form, setForm] = useState({
    aboutContent: "",
    storyContent: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const openEditDialog = (field) => {
    setEditField(field);
    setEditValue(form[field]);
    setEditDialogOpen(true);
    setEditError("");
  };
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditField("");
    setEditValue("");
    setEditError("");
  };
  const handleEditSave = async () => {
    setEditSaving(true);
    setEditError("");
    const updatedForm = { ...form, [editField]: editValue };
    try {
      await axios.put(API_URL, updatedForm);
      setForm(updatedForm);
      setSuccess(
        `${editField === "aboutContent" ? "About Content" : "Story Content"} updated successfully.`
      );
      closeEditDialog();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update content.");
    } finally {
      setEditSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(API_URL);
        if (res.data) {
          setForm(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch Footer Info.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Try PUT first (update), fallback to POST (create)
      await axios.put(API_URL, form);
      setSuccess("Footer Info updated successfully.");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // If not found, create new
        try {
          await axios.post(API_URL, form);
          setSuccess("Footer Info created successfully.");
        } catch (postErr) {
          setError(
            postErr.response?.data?.message || "Failed to create Footer Info."
          );
        }
      } else {
        setError(
          err.response?.data?.message || "Failed to update Footer Info."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Drag and drop handlers (UI only)
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedImage(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      // Use the correct backend URL for image upload
      const uploadRes = await axios.post(
        (process.env.REACT_APP_API_URL || "http://localhost:8000/api") +
          "/upload/image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // Save the new image URL to footer info
      const updatedForm = { ...form, image: imageUrl };
      try {
        await axios.put(API_URL, updatedForm);
        setForm(updatedForm);
        setSuccess("Image uploaded and saved successfully.");
        setDialogOpen(false);
        setSelectedImage(null);
      } catch (err) {
        setUploadError(
          err.response?.data?.message ||
            "Failed to save image URL to Footer Info."
        );
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Edit Footer Info (About Us Page)
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* About Content section with edit button */}
            <Box display="flex" alignItems="center" mt={2}>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  About Content
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {form.aboutContent}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ ml: 2 }}
                onClick={() => openEditDialog("aboutContent")}
              >
                Edit
              </Button>
            </Box>
            {/* Story Content section with edit button */}
            <Box display="flex" alignItems="center" mt={3}>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Story Content
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {form.storyContent}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ ml: 2 }}
                onClick={() => openEditDialog("storyContent")}
              >
                Edit
              </Button>
            </Box>
            {/* Remove About Content and Story Content text fields from the form */}
            {/* Remove Image URL field and preview */}
            <Box my={2} textAlign="center">
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleDialogOpen}
              >
                Edit Image
              </Button>
            </Box>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
            {/* <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : "Save"}
            </Button> */}
          </form>
        )}
      </Paper>
      {/* Dialog for drag-and-drop image upload (UI only) */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Upload Image</DialogTitle>
        <DialogContent>
          {/* Show current image if exists */}
          {form.image && (
            <Box mb={2} textAlign="center">
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                gutterBottom
              >
                Current Image
              </Typography>
              <img
                src={form.image}
                alt="Current"
                style={{
                  maxWidth: "100%",
                  maxHeight: 120,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            </Box>
          )}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              border: dragActive ? "2px solid #1976d2" : "2px dashed #ccc",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              background: dragActive ? "#f0f7ff" : "#fafafa",
              mb: 2,
            }}
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={inputRef}
              onChange={handleFileChange}
            />
            {selectedImage ? (
              <>
                <Typography variant="body2" gutterBottom>
                  {selectedImage.name}
                </Typography>
                <Box mt={2}>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 150,
                      borderRadius: 8,
                    }}
                  />
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop an image here, or click to select
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleImageUpload}
            disabled={!selectedImage || uploading}
            variant="contained"
            color="primary"
          >
            {uploading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </DialogActions>
        {uploadError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {uploadError}
          </Alert>
        )}
      </Dialog>
      {/* Edit dialog for About Content and Story Content */}
      <Dialog
        open={editDialogOpen}
        onClose={closeEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit{" "}
          {editField === "aboutContent" ? "About Content" : "Story Content"}
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            minRows={3}
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={editSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            disabled={editSaving || !editValue.trim()}
            variant="contained"
            color="primary"
          >
            {editSaving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
        {editError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {editError}
          </Alert>
        )}
      </Dialog>
    </Container>
  );
};

export default FooterInfo;
