import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const DATA_ENTRY_ID = "68764ef87d492357106bb01d"; // Use your actual DataEntry ID
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const DataEntry = () => {
  const [slideImages, setSlideImages] = useState([]);
  const [newsContent, setNewsContent] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [newsUpdating, setNewsUpdating] = useState(false);
  const [newsChanged, setNewsChanged] = useState(false);

  // Mobile slides state
  const [mobileSlideImages, setMobileSlideImages] = useState([]);
  const [mobileLoading, setMobileLoading] = useState(true);
  const [mobileError, setMobileError] = useState(null);
  const [mobileEditDialogOpen, setMobileEditDialogOpen] = useState(false);
  const [mobileEditIndex, setMobileEditIndex] = useState(null);
  const [mobileSelectedImage, setMobileSelectedImage] = useState(null);
  const [mobileNewImageFile, setMobileNewImageFile] = useState(null);
  const [mobileNewImagePreview, setMobileNewImagePreview] = useState(null);
  const [mobileUpdating, setMobileUpdating] = useState(false);
  const [mobileAddDialogOpen, setMobileAddDialogOpen] = useState(false);
  const [mobileAddImageFile, setMobileAddImageFile] = useState(null);
  const [mobileAddImagePreview, setMobileAddImagePreview] = useState(null);
  const [mobileAdding, setMobileAdding] = useState(false);

  // Collection images state
  const [collectionsImages, setCollectionsImages] = useState([]);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [collectionError, setCollectionError] = useState(null);
  const [collectionEditDialogOpen, setCollectionEditDialogOpen] =
    useState(false);
  const [collectionAddDialogOpen, setCollectionAddDialogOpen] = useState(false);
  const [collectionSelectedImage, setCollectionSelectedImage] = useState(null);
  const [collectionNewImageFile, setCollectionNewImageFile] = useState(null);
  const [collectionNewImagePreview, setCollectionNewImagePreview] =
    useState(null);
  const [collectionAdding, setCollectionAdding] = useState(false);
  const [collectionUpdating, setCollectionUpdating] = useState(false);

  // Mobile Collection images state
  const [mobileCollectionsImages, setMobileCollectionsImages] = useState([]);
  const [mobileCollectionLoading, setMobileCollectionLoading] = useState(true);
  const [mobileCollectionError, setMobileCollectionError] = useState(null);
  const [mobileCollectionEditDialogOpen, setMobileCollectionEditDialogOpen] =
    useState(false);
  const [mobileCollectionAddDialogOpen, setMobileCollectionAddDialogOpen] =
    useState(false);
  const [mobileCollectionSelectedImage, setMobileCollectionSelectedImage] =
    useState(null);
  const [mobileCollectionNewImageFile, setMobileCollectionNewImageFile] =
    useState(null);
  const [mobileCollectionNewImagePreview, setMobileCollectionNewImagePreview] =
    useState(null);
  const [mobileCollectionAdding, setMobileCollectionAdding] = useState(false);
  const [mobileCollectionUpdating, setMobileCollectionUpdating] =
    useState(false);
  const [mobileCollectionEditIndex, setMobileCollectionEditIndex] =
    useState(null);

  // Collections state
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState(null);
  const [collectionsEditDialogOpen, setCollectionsEditDialogOpen] =
    useState(false);
  const [collectionsAddDialogOpen, setCollectionsAddDialogOpen] =
    useState(false);
  const [collectionsSelected, setCollectionsSelected] = useState(null);
  const [collectionsNewValue, setCollectionsNewValue] = useState("");
  const [collectionsAdding, setCollectionsAdding] = useState(false);
  const [collectionsUpdating, setCollectionsUpdating] = useState(false);
  const [collectionsEditIndex, setCollectionsEditIndex] = useState(null);

  // Explore Collection state
  const [exploreCollection, setExploreCollection] = useState([]);
  const [exploreCollectionLoading, setExploreCollectionLoading] =
    useState(true);
  const [exploreCollectionError, setExploreCollectionError] = useState(null);
  const [exploreCollectionEditDialogOpen, setExploreCollectionEditDialogOpen] =
    useState(false);
  const [exploreCollectionAddDialogOpen, setExploreCollectionAddDialogOpen] =
    useState(false);
  const [exploreCollectionSelected, setExploreCollectionSelected] =
    useState(null);
  const [exploreCollectionNewValue, setExploreCollectionNewValue] =
    useState("");
  const [exploreCollectionAdding, setExploreCollectionAdding] = useState(false);
  const [exploreCollectionUpdating, setExploreCollectionUpdating] =
    useState(false);
  const [exploreCollectionEditIndex, setExploreCollectionEditIndex] =
    useState(null);
  const [exploreCollectionNewImageFile, setExploreCollectionNewImageFile] =
    useState(null);
  const [
    exploreCollectionNewImagePreview,
    setExploreCollectionNewImagePreview,
  ] = useState(null);

  useEffect(() => {
    const getImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/slide-images`
        );
        setSlideImages(response.data.slideImages || []);
      } catch (err) {
        setError(err.message || "Failed to load images");
      } finally {
        setLoading(false);
      }
    };
    getImages();
    // Fetch news content
    const getNewsContent = async () => {
      try {
        setNewsLoading(true);
        setNewsError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/news-content`
        );
        setNewsContent(response.data.newsContent || "");
      } catch (err) {
        setNewsError(err.message || "Failed to load news content");
      } finally {
        setNewsLoading(false);
      }
    };
    getNewsContent();
  }, []);

  // Fetch mobile slides on mount
  useEffect(() => {
    const getMobileSlides = async () => {
      try {
        setMobileLoading(true);
        setMobileError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-slide-images`
        );
        setMobileSlideImages(response.data.mobileSlideImages || []);
      } catch (err) {
        setMobileError(err.message || "Failed to load mobile images");
      } finally {
        setMobileLoading(false);
      }
    };
    getMobileSlides();
  }, []);

  // Fetch collection images on mount
  useEffect(() => {
    const getCollectionImages = async () => {
      try {
        setCollectionLoading(true);
        setCollectionError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collection-images`
        );
        setCollectionsImages(response.data.collectionsImages || []);
      } catch (err) {
        setCollectionError(err.message || "Failed to load collection images");
      } finally {
        setCollectionLoading(false);
      }
    };
    getCollectionImages();
  }, []);

  // Fetch mobile collection images on mount
  useEffect(() => {
    const getMobileCollectionImages = async () => {
      try {
        setMobileCollectionLoading(true);
        setMobileCollectionError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-collection-images`
        );
        setMobileCollectionsImages(response.data.mobileCollectionsImages || []);
      } catch (err) {
        setMobileCollectionError(
          err.message || "Failed to load mobile collection images"
        );
      } finally {
        setMobileCollectionLoading(false);
      }
    };
    getMobileCollectionImages();
  }, []);

  // Fetch collections on mount
  useEffect(() => {
    const getCollections = async () => {
      try {
        setCollectionsLoading(true);
        setCollectionsError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`
        );
        setCollections(response.data.collections || []);
      } catch (err) {
        setCollectionsError(err.message || "Failed to load collections");
      } finally {
        setCollectionsLoading(false);
      }
    };
    getCollections();
  }, []);

  // Fetch exploreCollection on mount
  useEffect(() => {
    const getExploreCollection = async () => {
      try {
        setExploreCollectionLoading(true);
        setExploreCollectionError(null);
        const response = await axios.get(
          `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`
        );
        setExploreCollection(response.data.collections || []);
      } catch (err) {
        setExploreCollectionError(err.message || "Failed to load collections");
      } finally {
        setExploreCollectionLoading(false);
      }
    };
    getExploreCollection();
  }, []);

  const handleDeleteImage = async (index) => {
    if (slideImages.length <= 1) {
      alert("At least one image is required.");
      return;
    }
    const updatedImages = slideImages.filter((_, i) => i !== index);
    setSlideImages(updatedImages);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/slide-images`,
        { slideImages: updatedImages }
      );
    } catch (err) {
      alert(
        "Failed to update images: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEditImage = (index) => {
    setEditIndex(index);
    setSelectedImage(slideImages[index]);
    setNewImageFile(null);
    setNewImagePreview(null);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setEditIndex(null);
    setSelectedImage(null);
    setNewImageFile(null);
    setNewImagePreview(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpdateImage = async () => {
    if (!newImageFile) return;
    setUpdating(true);
    try {
      // 1. Upload image to backend
      const formData = new FormData();
      formData.append("image", newImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // 2. Update slideImages array
      const updatedImages = slideImages.map((img, i) =>
        i === editIndex ? imageUrl : img
      );
      setSlideImages(updatedImages);
      // 3. Persist to backend
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/slide-images`,
        { slideImages: updatedImages }
      );
      handleDialogClose();
    } catch (err) {
      alert(
        "Failed to update image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdating(false);
    }
  };

  // Add image dialog handlers
  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
    setAddImageFile(null);
    setAddImagePreview(null);
  };
  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setAddImageFile(null);
    setAddImagePreview(null);
  };
  const handleAddDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setAddImageFile(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };
  const handleAddFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddImageFile(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };
  const handleAddDragOver = (e) => {
    e.preventDefault();
  };
  const handleAddImage = async () => {
    if (!addImageFile) return;
    setAdding(true);
    try {
      // 1. Upload image to backend
      const formData = new FormData();
      formData.append("image", addImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // 2. Add to slideImages array
      const updatedImages = [...slideImages, imageUrl];
      setSlideImages(updatedImages);
      // 3. Persist to backend
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/slide-images`,
        { slideImages: updatedImages }
      );
      handleAddDialogClose();
    } catch (err) {
      alert(
        "Failed to add image: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAdding(false);
    }
  };

  // Mobile: Add
  const handleMobileAddDialogOpen = () => {
    setMobileAddDialogOpen(true);
    setMobileAddImageFile(null);
    setMobileAddImagePreview(null);
  };
  const handleMobileAddDialogClose = () => {
    setMobileAddDialogOpen(false);
    setMobileAddImageFile(null);
    setMobileAddImagePreview(null);
  };
  const handleMobileAddDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setMobileAddImageFile(file);
      setMobileAddImagePreview(URL.createObjectURL(file));
    }
  };
  const handleMobileAddFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileAddImageFile(file);
      setMobileAddImagePreview(URL.createObjectURL(file));
    }
  };
  const handleMobileAddDragOver = (e) => {
    e.preventDefault();
  };
  const handleMobileAddImage = async () => {
    if (!mobileAddImageFile) return;
    setMobileAdding(true);
    try {
      const formData = new FormData();
      formData.append("image", mobileAddImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      const updatedImages = [...mobileSlideImages, imageUrl];
      setMobileSlideImages(updatedImages);
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-slide-images`,
        { mobileSlideImages: updatedImages }
      );
      handleMobileAddDialogClose();
    } catch (err) {
      alert(
        "Failed to add mobile image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setMobileAdding(false);
    }
  };

  // Mobile: Edit
  const handleMobileEditImage = (index) => {
    setMobileEditIndex(index);
    setMobileSelectedImage(mobileSlideImages[index]);
    setMobileNewImageFile(null);
    setMobileNewImagePreview(null);
    setMobileEditDialogOpen(true);
  };
  const handleMobileEditDialogClose = () => {
    setMobileEditDialogOpen(false);
    setMobileEditIndex(null);
    setMobileSelectedImage(null);
    setMobileNewImageFile(null);
    setMobileNewImagePreview(null);
  };
  const handleMobileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setMobileNewImageFile(file);
      setMobileNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileNewImageFile(file);
      setMobileNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleMobileDragOver = (e) => {
    e.preventDefault();
  };
  const handleMobileUpdateImage = async () => {
    if (!mobileNewImageFile) return;
    setMobileUpdating(true);
    try {
      const formData = new FormData();
      formData.append("image", mobileNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      const updatedImages = mobileSlideImages.map((img, i) =>
        i === mobileEditIndex ? imageUrl : img
      );
      setMobileSlideImages(updatedImages);
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-slide-images`,
        { mobileSlideImages: updatedImages }
      );
      handleMobileEditDialogClose();
    } catch (err) {
      alert(
        "Failed to update mobile image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setMobileUpdating(false);
    }
  };

  // Mobile: Delete
  const handleMobileDeleteImage = async (index) => {
    if (mobileSlideImages.length <= 1) {
      alert("At least one image is required.");
      return;
    }
    const updatedImages = mobileSlideImages.filter((_, i) => i !== index);
    setMobileSlideImages(updatedImages);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-slide-images`,
        { mobileSlideImages: updatedImages }
      );
    } catch (err) {
      alert(
        "Failed to update mobile images: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Collection: Add
  const handleCollectionAddDialogOpen = () => {
    setCollectionAddDialogOpen(true);
    setCollectionNewImageFile(null);
    setCollectionNewImagePreview(null);
  };
  const handleCollectionAddDialogClose = () => {
    setCollectionAddDialogOpen(false);
    setCollectionNewImageFile(null);
    setCollectionNewImagePreview(null);
  };
  const handleCollectionAddDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setCollectionNewImageFile(file);
      setCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleCollectionAddFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCollectionNewImageFile(file);
      setCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleCollectionAddDragOver = (e) => {
    e.preventDefault();
  };
  const handleCollectionAddImage = async () => {
    if (!collectionNewImageFile) return;
    setCollectionAdding(true);
    try {
      const formData = new FormData();
      formData.append("image", collectionNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      const updatedImages = [...collectionsImages, imageUrl];
      setCollectionsImages(updatedImages);
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collection-images`,
        { collectionsImages: updatedImages }
      );
      handleCollectionAddDialogClose();
    } catch (err) {
      alert(
        "Failed to add collection image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCollectionAdding(false);
    }
  };

  // Collection: Edit
  const handleCollectionEditImage = (index) => {
    setCollectionEditDialogOpen(true);
    setCollectionSelectedImage(collectionsImages[index]);
    setCollectionNewImageFile(null);
    setCollectionNewImagePreview(null);
  };
  const handleCollectionEditDialogClose = () => {
    setCollectionEditDialogOpen(false);
    setCollectionSelectedImage(null);
    setCollectionNewImageFile(null);
    setCollectionNewImagePreview(null);
  };
  const handleCollectionDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setCollectionNewImageFile(file);
      setCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleCollectionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCollectionNewImageFile(file);
      setCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleCollectionDragOver = (e) => {
    e.preventDefault();
  };
  const handleCollectionUpdateImage = async () => {
    if (!collectionNewImageFile) return;
    setCollectionUpdating(true);
    try {
      const formData = new FormData();
      formData.append("image", collectionNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      const updatedImages = collectionsImages.map((img, i) =>
        i === collectionsImages.indexOf(collectionSelectedImage)
          ? imageUrl
          : img
      );
      setCollectionsImages(updatedImages);
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collection-images`,
        { collectionsImages: updatedImages }
      );
      handleCollectionEditDialogClose();
    } catch (err) {
      alert(
        "Failed to update collection image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCollectionUpdating(false);
    }
  };

  // Collection: Delete
  const handleCollectionDeleteImage = async (index) => {
    if (collectionsImages.length <= 1) {
      alert("At least one image is required.");
      return;
    }
    const updatedImages = collectionsImages.filter((_, i) => i !== index);
    setCollectionsImages(updatedImages);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collection-images`,
        { collectionsImages: updatedImages }
      );
    } catch (err) {
      alert(
        "Failed to update collection images: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Mobile Collection: Add
  const handleMobileCollectionAddDialogOpen = () => {
    setMobileCollectionAddDialogOpen(true);
    setMobileCollectionNewImageFile(null);
    setMobileCollectionNewImagePreview(null);
  };

  const handleMobileCollectionAddDialogClose = () => {
    setMobileCollectionAddDialogOpen(false);
    setMobileCollectionNewImageFile(null);
    setMobileCollectionNewImagePreview(null);
  };

  const handleMobileCollectionAddDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setMobileCollectionNewImageFile(file);
      setMobileCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMobileCollectionAddFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileCollectionNewImageFile(file);
      setMobileCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMobileCollectionAddDragOver = (e) => {
    e.preventDefault();
  };

  const handleMobileCollectionAddImage = async () => {
    if (!mobileCollectionNewImageFile) return;
    setMobileCollectionAdding(true);
    try {
      // 1. Upload image to backend
      const formData = new FormData();
      formData.append("image", mobileCollectionNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // 2. Add to mobileCollectionsImages array
      const updatedImages = [...mobileCollectionsImages, imageUrl];
      setMobileCollectionsImages(updatedImages);
      // 3. Persist to backend
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-collection-images`,
        { mobileCollectionsImages: updatedImages }
      );
      handleMobileCollectionAddDialogClose();
    } catch (err) {
      alert(
        "Failed to add mobile collection image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setMobileCollectionAdding(false);
    }
  };

  // Mobile Collection: Edit
  const handleMobileCollectionEditImage = (index) => {
    setMobileCollectionEditIndex(index);
    setMobileCollectionSelectedImage(mobileCollectionsImages[index]);
    setMobileCollectionNewImageFile(null);
    setMobileCollectionNewImagePreview(null);
    setMobileCollectionEditDialogOpen(true);
  };

  const handleMobileCollectionEditDialogClose = () => {
    setMobileCollectionEditDialogOpen(false);
    setMobileCollectionEditIndex(null);
    setMobileCollectionSelectedImage(null);
    setMobileCollectionNewImageFile(null);
    setMobileCollectionNewImagePreview(null);
  };

  const handleMobileCollectionDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setMobileCollectionNewImageFile(file);
      setMobileCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMobileCollectionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileCollectionNewImageFile(file);
      setMobileCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMobileCollectionDragOver = (e) => {
    e.preventDefault();
  };

  const handleMobileCollectionUpdateImage = async () => {
    if (!mobileCollectionNewImageFile) return;
    setMobileCollectionUpdating(true);
    try {
      // 1. Upload image to backend
      const formData = new FormData();
      formData.append("image", mobileCollectionNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // 2. Update mobileCollectionsImages array
      const updatedImages = mobileCollectionsImages.map((img, i) =>
        i === mobileCollectionEditIndex ? imageUrl : img
      );
      setMobileCollectionsImages(updatedImages);
      // 3. Persist to backend
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-collection-images`,
        { mobileCollectionsImages: updatedImages }
      );
      handleMobileCollectionEditDialogClose();
    } catch (err) {
      alert(
        "Failed to update mobile collection image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setMobileCollectionUpdating(false);
    }
  };

  // Mobile Collection: Delete
  const handleMobileCollectionDeleteImage = async (index) => {
    if (mobileCollectionsImages.length <= 1) {
      alert("At least one image is required.");
      return;
    }
    const updatedImages = mobileCollectionsImages.filter((_, i) => i !== index);
    setMobileCollectionsImages(updatedImages);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/mobile-collection-images`,
        { mobileCollectionsImages: updatedImages }
      );
    } catch (err) {
      alert(
        "Failed to update mobile collection images: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleNewsContentChange = (e) => {
    setNewsContent(e.target.value);
    setNewsChanged(true);
  };
  const handleUpdateNewsContent = async () => {
    setNewsUpdating(true);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/news-content`,
        { newsContent }
      );
      setNewsChanged(false);
    } catch (err) {
      alert(
        "Failed to update news content: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setNewsUpdating(false);
    }
  };

  // Add Collection
  const handleCollectionsAddDialogOpen = () => {
    setCollectionsAddDialogOpen(true);
    setCollectionsNewValue("");
  };
  const handleCollectionsAddDialogClose = () => {
    setCollectionsAddDialogOpen(false);
    setCollectionsNewValue("");
  };
  const handleCollectionsAddChange = (e) => {
    setCollectionsNewValue(e.target.value);
  };
  const handleCollectionsAdd = async () => {
    if (!collectionsNewValue) return;
    setCollectionsAdding(true);
    try {
      const updatedCollections = [...collections, collectionsNewValue];
      setCollections(updatedCollections);
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`,
        { collections: updatedCollections }
      );
      handleCollectionsAddDialogClose();
    } catch (err) {
      alert(
        "Failed to add collection: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCollectionsAdding(false);
    }
  };

  // Edit Collection
  const handleCollectionsEditDialogOpen = (index) => {
    setCollectionsEditDialogOpen(true);
    setCollectionsEditIndex(index);
    setCollectionsSelected(collections[index]);
    setCollectionsNewValue(collections[index]);
  };
  const handleCollectionsEditDialogClose = () => {
    setCollectionsEditDialogOpen(false);
    setCollectionsEditIndex(null);
    setCollectionsSelected(null);
    setCollectionsNewValue("");
  };
  const handleCollectionsEditChange = (e) => {
    setCollectionsNewValue(e.target.value);
  };
  const handleCollectionsUpdate = async () => {
    if (!collectionsNewValue) return;
    setCollectionsUpdating(true);
    try {
      const updatedCollections = collections.map((item, i) =>
        i === collectionsEditIndex ? collectionsNewValue : item
      );
      setCollections(updatedCollections);
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`,
        { collections: updatedCollections }
      );
      handleCollectionsEditDialogClose();
    } catch (err) {
      alert(
        "Failed to update collection: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCollectionsUpdating(false);
    }
  };

  // Delete Collection
  const handleCollectionsDelete = async (index) => {
    if (collections.length <= 1) {
      alert("At least one collection is required.");
      return;
    }
    const updatedCollections = collections.filter((_, i) => i !== index);
    setCollections(updatedCollections);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`,
        { collections: updatedCollections }
      );
    } catch (err) {
      alert(
        "Failed to update collections: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Add Explore Collection
  const handleExploreCollectionAddDialogOpen = () => {
    setExploreCollectionAddDialogOpen(true);
    setExploreCollectionNewValue("");
    setExploreCollectionNewImageFile(null);
    setExploreCollectionNewImagePreview(null);
  };
  const handleExploreCollectionAddDialogClose = () => {
    setExploreCollectionAddDialogOpen(false);
    setExploreCollectionNewValue("");
    setExploreCollectionNewImageFile(null);
    setExploreCollectionNewImagePreview(null);
  };
  const handleExploreCollectionAddChange = (e) => {
    setExploreCollectionNewValue(e.target.value);
  };
  const handleExploreCollectionAddFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExploreCollectionNewImageFile(file);
      setExploreCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleExploreCollectionAddDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setExploreCollectionNewImageFile(file);
      setExploreCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleExploreCollectionAddDragOver = (e) => {
    e.preventDefault();
  };
  const handleExploreCollectionAdd = async () => {
    if (!exploreCollectionNewImageFile) return;
    setExploreCollectionAdding(true);
    try {
      // 1. Upload image to backend
      const formData = new FormData();
      formData.append("image", exploreCollectionNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // 2. Add to exploreCollection array
      const updatedExploreCollection = [...exploreCollection, imageUrl];
      setExploreCollection(updatedExploreCollection);
      // 3. Persist to backend
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`,
        { collections: updatedExploreCollection }
      );
      handleExploreCollectionAddDialogClose();
    } catch (err) {
      alert(
        "Failed to add collection: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setExploreCollectionAdding(false);
    }
  };

  // Edit Explore Collection
  const handleExploreCollectionEditDialogOpen = (index) => {
    setExploreCollectionEditDialogOpen(true);
    setExploreCollectionEditIndex(index);
    setExploreCollectionSelected(exploreCollection[index]);
    setExploreCollectionNewImageFile(null);
    setExploreCollectionNewImagePreview(null);
  };
  const handleExploreCollectionEditDialogClose = () => {
    setExploreCollectionEditDialogOpen(false);
    setExploreCollectionEditIndex(null);
    setExploreCollectionSelected(null);
    setExploreCollectionNewImageFile(null);
    setExploreCollectionNewImagePreview(null);
  };
  const handleExploreCollectionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExploreCollectionNewImageFile(file);
      setExploreCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleExploreCollectionDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setExploreCollectionNewImageFile(file);
      setExploreCollectionNewImagePreview(URL.createObjectURL(file));
    }
  };
  const handleExploreCollectionDragOver = (e) => {
    e.preventDefault();
  };
  const handleExploreCollectionUpdate = async () => {
    if (!exploreCollectionNewImageFile) return;
    setExploreCollectionUpdating(true);
    try {
      // 1. Upload image to backend
      const formData = new FormData();
      formData.append("image", exploreCollectionNewImageFile);
      const uploadRes = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrl = uploadRes.data.imageUrl;
      // 2. Update exploreCollection array
      const updatedExploreCollection = exploreCollection.map((item, i) =>
        i === exploreCollectionEditIndex ? imageUrl : item
      );
      setExploreCollection(updatedExploreCollection);
      // 3. Persist to backend
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`,
        { collections: updatedExploreCollection }
      );
      handleExploreCollectionEditDialogClose();
    } catch (err) {
      alert(
        "Failed to update collection: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setExploreCollectionUpdating(false);
    }
  };

  // Delete Explore Collection
  const handleExploreCollectionDelete = async (index) => {
    if (exploreCollection.length <= 1) {
      alert("At least one collection is required.");
      return;
    }
    const updatedExploreCollection = exploreCollection.filter(
      (_, i) => i !== index
    );
    setExploreCollection(updatedExploreCollection);
    try {
      await axios.put(
        `${API_BASE_URL}/data-entry/${DATA_ENTRY_ID}/collections`,
        { collections: updatedExploreCollection }
      );
    } catch (err) {
      alert(
        "Failed to update collections: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Content
      </Typography>
      {/* Dekstop */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          DekStop Slide Images
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleAddDialogOpen}
        >
          Add Image
        </Button>
        {loading ? (
          <Typography>Loading images...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <List>
            {slideImages.map((img, idx) => (
              <ListItem key={idx}>
                <img
                  src={img}
                  alt={`slide-${idx}`}
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: "cover",
                    marginRight: 12,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                {/* <ListItemText primary={img} /> */}
                <ListItemSecondaryAction>
                  <Button onClick={() => handleEditImage(idx)} size="small">
                    Edit
                  </Button>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDeleteImage(idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* mobile  */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Mobile Slide Images
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleMobileAddDialogOpen}
        >
          Add Image
        </Button>
        {mobileLoading ? (
          <Typography>Loading images...</Typography>
        ) : mobileError ? (
          <Typography color="error">{mobileError}</Typography>
        ) : (
          <List>
            {mobileSlideImages.map((img, idx) => (
              <ListItem key={idx}>
                <img
                  src={img}
                  alt={`mobile-slide-${idx}`}
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: "cover",
                    marginRight: 12,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => handleMobileEditImage(idx)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleMobileDeleteImage(idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      {/* Mobile Add Image Dialog */}
      <Dialog
        open={mobileAddDialogOpen}
        onClose={handleMobileAddDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Mobile Slide Image</DialogTitle>
        <DialogContent>
          <Box
            onDrop={handleMobileAddDrop}
            onDragOver={handleMobileAddDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("mobile-add-file-input").click()
            }
          >
            <input
              id="mobile-add-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleMobileAddFileChange}
            />
            {mobileAddImagePreview ? (
              <img
                src={mobileAddImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
            {/* Mobile recommended size */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Recommended size (Mobile): <b>800 x 800 px</b>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMobileAddDialogClose}>Cancel</Button>
          <Button
            onClick={handleMobileAddImage}
            variant="contained"
            color="primary"
            disabled={!mobileAddImagePreview || mobileAdding}
          >
            {mobileAdding ? "Uploading..." : "Upload Image"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Mobile Edit Image Dialog */}
      <Dialog
        open={mobileEditDialogOpen}
        onClose={handleMobileEditDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Mobile Slide Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Image
            </Typography>
            {mobileSelectedImage && (
              <img
                src={mobileSelectedImage}
                alt="current"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box
            onDrop={handleMobileDrop}
            onDragOver={handleMobileDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("mobile-file-input").click()}
          >
            <input
              id="mobile-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleMobileFileChange}
            />
            {mobileNewImagePreview ? (
              <img
                src={mobileNewImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMobileEditDialogClose}>Cancel</Button>
          <Button
            onClick={handleMobileUpdateImage}
            variant="contained"
            color="primary"
            disabled={!mobileNewImagePreview || mobileUpdating}
          >
            {mobileUpdating ? "Updating..." : "Update Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collection Images Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Collection Images
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleCollectionAddDialogOpen}
        >
          Add Image
        </Button>
        {collectionLoading ? (
          <Typography>Loading images...</Typography>
        ) : collectionError ? (
          <Typography color="error">{collectionError}</Typography>
        ) : (
          <List>
            {collectionsImages.map((img, idx) => (
              <ListItem key={idx}>
                <img
                  src={img}
                  alt={`collection-${idx}`}
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: "cover",
                    marginRight: 12,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => handleCollectionEditImage(idx)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleCollectionDeleteImage(idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Mobile Collection Images
        </Typography>
        {/* <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleMobileCollectionAddDialogOpen}
        >
          Add Image
        </Button> */}
        {mobileCollectionLoading ? (
          <Typography>Loading images...</Typography>
        ) : mobileCollectionError ? (
          <Typography color="error">{mobileCollectionError}</Typography>
        ) : (
          <List>
            {mobileCollectionsImages.map((img, idx) => (
              <ListItem key={idx}>
                <img
                  src={img}
                  alt={`mobile-collection-${idx}`}
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: "cover",
                    marginRight: 12,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => handleMobileCollectionEditImage(idx)}
                    size="small"
                  >
                    Edit
                  </Button>
                  {/* <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleMobileCollectionDeleteImage(idx)}
                  >
                    <DeleteIcon />
                  </IconButton> */}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      {/* Add Collection Image Dialog */}
      <Dialog
        open={collectionAddDialogOpen}
        onClose={handleCollectionAddDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Collection Image</DialogTitle>
        <DialogContent>
          <Box
            onDrop={handleCollectionAddDrop}
            onDragOver={handleCollectionAddDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("collection-add-file-input").click()
            }
          >
            <input
              id="collection-add-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCollectionAddFileChange}
            />
            {collectionNewImagePreview ? (
              <img
                src={collectionNewImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollectionAddDialogClose}>Cancel</Button>
          <Button
            onClick={handleCollectionAddImage}
            variant="contained"
            color="primary"
            disabled={!collectionNewImagePreview || collectionAdding}
          >
            {collectionAdding ? "Uploading..." : "Upload Image"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Collection Image Dialog */}
      <Dialog
        open={collectionEditDialogOpen}
        onClose={handleCollectionEditDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Edit Collection Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Image
            </Typography>
            {collectionSelectedImage && (
              <img
                src={collectionSelectedImage}
                alt="current"
                style={{
                  width: 1000,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box
            onDrop={handleCollectionDrop}
            onDragOver={handleCollectionDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("collection-file-input").click()
            }
          >
            <input
              id="collection-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCollectionFileChange}
            />
            {collectionNewImagePreview ? (
              <img
                src={collectionNewImagePreview}
                alt="preview"
                style={{
                  width: 1000,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollectionEditDialogClose}>Cancel</Button>
          <Button
            onClick={handleCollectionUpdateImage}
            variant="contained"
            color="primary"
            disabled={!collectionNewImagePreview || collectionUpdating}
          >
            {collectionUpdating ? "Updating..." : "Update Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collections */}
      {/* <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Collections
        </Typography>
      
        {collectionsLoading ? (
          <Typography>Loading collections...</Typography>
        ) : collectionsError ? (
          <Typography color="error">{collectionsError}</Typography>
        ) : (
          <List>
            {collections.map((item, idx) => (
              <ListItem key={idx}>
                <img
                  src={item}
                  alt={`collection-${idx}`}
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: "cover",
                    marginRight: 12,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                <ListItemText primary={item.split("/").pop()} />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => handleExploreCollectionAddDialogOpen(idx)}
                    size="small"
                  >
                    Edit
                  </Button>
                 
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper> */}

      {/* Explore Collections */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Explore Collections
        </Typography>
        
        {exploreCollectionLoading ? (
          <Typography>Loading collections...</Typography>
        ) : exploreCollectionError ? (
          <Typography color="error">{exploreCollectionError}</Typography>
        ) : (
          <List>
            {exploreCollection.map((img, idx) => (
              <ListItem key={idx}>
                <img
                  src={img}
                  alt={`explore-collection-${idx}`}
                  style={{
                    width: 60,
                    height: 40,
                    objectFit: "cover",
                    marginRight: 12,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                <ListItemSecondaryAction>
                  <Button
                    onClick={() => handleExploreCollectionEditDialogOpen(idx)}
                    size="small"
                  >
                    Edit
                  </Button>
                  
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* newscroller */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          News Content
        </Typography>
        {newsLoading ? (
          <Typography>Loading news content...</Typography>
        ) : newsError ? (
          <Typography color="error">{newsError}</Typography>
        ) : (
          <>
            <TextField
              label="News Content"
              value={newsContent}
              onChange={handleNewsContentChange}
              fullWidth
              multiline
              minRows={3}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateNewsContent}
              disabled={!newsChanged || newsUpdating}
            >
              {newsUpdating ? "Updating..." : "Update News Content"}
            </Button>
          </>
        )}
      </Paper>
      {/* Save/Update button for backend integration later */}

      {/* Edit Image Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Slide Image</DialogTitle>
        <DialogContent>
          {/* Top: Existing image */}
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Image
            </Typography>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="current"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Bottom: Drag and drop */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("file-input").click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {newImagePreview ? (
              <img
                src={newImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleUpdateImage}
            variant="contained"
            color="primary"
            disabled={!newImagePreview || updating}
          >
            {updating ? "Updating..." : "Update Image"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Image Dialog (Desktop) */}
      <Dialog
        open={addDialogOpen}
        onClose={handleAddDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Slide Image</DialogTitle>
        <DialogContent>
          <Box
            onDrop={handleAddDrop}
            onDragOver={handleAddDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() => document.getElementById("add-file-input").click()}
          >
            <input
              id="add-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAddFileChange}
            />
            {addImagePreview ? (
              <img
                src={addImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
            {/* Desktop recommended size */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Recommended size (Desktop): <b>1920 x 600 px</b>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Cancel</Button>
          <Button
            onClick={handleAddImage}
            variant="contained"
            color="primary"
            disabled={!addImagePreview || adding}
          >
            {adding ? "Uploading..." : "Upload Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Collection Add Image Dialog */}
      <Dialog
        open={mobileCollectionAddDialogOpen}
        onClose={handleMobileCollectionAddDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Mobile Collection Image</DialogTitle>
        <DialogContent>
          <Box
            onDrop={handleMobileCollectionAddDrop}
            onDragOver={handleMobileCollectionAddDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document
                .getElementById("mobile-collection-add-file-input")
                .click()
            }
          >
            <input
              id="mobile-collection-add-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleMobileCollectionAddFileChange}
            />
            {mobileCollectionNewImagePreview ? (
              <img
                src={mobileCollectionNewImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
            {/* Mobile recommended size */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Recommended size (Mobile): <b>375 x 200 px</b>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMobileCollectionAddDialogClose}>Cancel</Button>
          <Button
            onClick={handleMobileCollectionAddImage}
            variant="contained"
            color="primary"
            disabled={
              !mobileCollectionNewImagePreview || mobileCollectionAdding
            }
          >
            {mobileCollectionAdding ? "Uploading..." : "Upload Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Collection Edit Image Dialog */}
      <Dialog
        open={mobileCollectionEditDialogOpen}
        onClose={handleMobileCollectionEditDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Mobile Collection Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Image
            </Typography>
            {mobileCollectionSelectedImage && (
              <img
                src={mobileCollectionSelectedImage}
                alt="current"
                style={{
                  width: 400,
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Bottom: Drag and drop */}
          <Box
            onDrop={handleMobileCollectionDrop}
            onDragOver={handleMobileCollectionDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("mobile-collection-file-input").click()
            }
          >
            <input
              id="mobile-collection-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleMobileCollectionFileChange}
            />
            {mobileCollectionNewImagePreview ? (
              <img
                src={mobileCollectionNewImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
            {/* Mobile recommended size */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Recommended size (Mobile): <b>375 x 200 px</b>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMobileCollectionEditDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleMobileCollectionUpdateImage}
            variant="contained"
            color="primary"
            disabled={
              !mobileCollectionNewImagePreview || mobileCollectionUpdating
            }
          >
            {mobileCollectionUpdating ? "Updating..." : "Update Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collections Add Dialog */}
      <Dialog
        open={collectionsAddDialogOpen}
        onClose={handleCollectionsAddDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Collection</DialogTitle>
        <DialogContent>
          <TextField
            label="New Collection Name"
            value={collectionsNewValue}
            onChange={handleCollectionsAddChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollectionsAddDialogClose}>Cancel</Button>
          <Button
            onClick={handleCollectionsAdd}
            variant="contained"
            color="primary"
            disabled={!collectionsNewValue || collectionsAdding}
          >
            {collectionsAdding ? "Adding..." : "Add Collection"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collections Edit Dialog */}
      <Dialog
        open={collectionsEditDialogOpen}
        onClose={handleCollectionsEditDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          <TextField
            label="Collection Name"
            value={collectionsNewValue}
            onChange={handleCollectionsEditChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCollectionsEditDialogClose}>Cancel</Button>
          <Button
            onClick={handleCollectionsUpdate}
            variant="contained"
            color="primary"
            disabled={!collectionsNewValue || collectionsUpdating}
          >
            {collectionsUpdating ? "Updating..." : "Update Collection"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Explore Collections Add Dialog */}
      <Dialog
        open={exploreCollectionAddDialogOpen}
        onClose={handleExploreCollectionAddDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Explore Collection Image</DialogTitle>
        <DialogContent>
          <Box
            onDrop={handleExploreCollectionAddDrop}
            onDragOver={handleExploreCollectionAddDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document
                .getElementById("explore-collection-add-file-input")
                .click()
            }
          >
            <input
              id="explore-collection-add-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleExploreCollectionAddFileChange}
            />
            {exploreCollectionNewImagePreview ? (
              <img
                src={exploreCollectionNewImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
            {/* Mobile recommended size */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Recommended size (Mobile): <b>375 x 200 px</b>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExploreCollectionAddDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExploreCollectionAdd}
            variant="contained"
            color="primary"
            disabled={
              !exploreCollectionNewImagePreview || exploreCollectionAdding
            }
          >
            {exploreCollectionAdding ? "Uploading..." : "Upload Image"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Explore Collections Edit Dialog */}
      <Dialog
        open={exploreCollectionEditDialogOpen}
        onClose={handleExploreCollectionEditDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Explore Collection Image</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Image
            </Typography>
            {exploreCollectionSelected && (
              <img
                src={exploreCollectionSelected}
                alt="current"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
          {/* Bottom: Drag and drop */}
          <Box
            onDrop={handleExploreCollectionDrop}
            onDragOver={handleExploreCollectionDragOver}
            sx={{
              border: "2px dashed #aaa",
              borderRadius: 6,
              p: 2,
              textAlign: "center",
              mb: 2,
              background: "#fafafa",
              cursor: "pointer",
            }}
            onClick={() =>
              document.getElementById("explore-collection-file-input").click()
            }
          >
            <input
              id="explore-collection-file-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleExploreCollectionFileChange}
            />
            {exploreCollectionNewImagePreview ? (
              <img
                src={exploreCollectionNewImagePreview}
                alt="preview"
                style={{
                  width: 180,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                Drag & drop a new image here, or click to select
              </Typography>
            )}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                Recommended size: <b>180 x 120 px</b>
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExploreCollectionEditDialogClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExploreCollectionUpdate}
            variant="contained"
            color="primary"
            disabled={
              !exploreCollectionNewImagePreview || exploreCollectionUpdating
            }
          >
            {exploreCollectionUpdating ? "Updating..." : "Update Image"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataEntry;
