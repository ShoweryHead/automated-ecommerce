import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Typography, Button, Grid, Paper, Chip, TextField, MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel, Divider, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Edit, Delete, Add, Refresh, Schedule, CheckCircle, Cancel, Image, Email } from '@mui/icons-material';
import dynamic from 'next/dynamic';

// Import rich text editor with dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function BlogAdmin() {
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for blog data
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [calendar, setCalendar] = useState(null);
  
  // State for loading and errors
  const [loading, setLoading] = useState({
    topics: false,
    posts: false,
    settings: false,
    calendar: false,
    generation: false
  });
  const [error, setError] = useState({
    topics: null,
    posts: null,
    settings: null,
    calendar: null,
    generation: null
  });
  
  // State for forms
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    contentType: 'product',
    primaryKeyword: '',
    secondaryKeywords: [],
    status: 'suggested'
  });
  
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    contentType: 'product',
    status: 'draft',
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: ''
    }
  });
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for generation options
  const [generationOptions, setGenerationOptions] = useState({
    count: 5,
    contentTypes: ['product', 'industry_news', 'how_to', 'case_study']
  });
  
  // State for review form
  const [reviewForm, setReviewForm] = useState({
    status: 'approved',
    notes: '',
    publishNow: false,
    content: ''
  });
  
  // Load initial data
  useEffect(() => {
    fetchTopics();
    fetchPosts();
    fetchSettings();
    fetchCalendar();
  }, []);
  
  // Fetch topics
  const fetchTopics = async () => {
    setLoading(prev => ({ ...prev, topics: true }));
    setError(prev => ({ ...prev, topics: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/blog/topics');
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.topics);
      } else {
        setError(prev => ({ ...prev, topics: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, topics: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  };
  
  // Fetch posts
  const fetchPosts = async () => {
    setLoading(prev => ({ ...prev, posts: true }));
    setError(prev => ({ ...prev, posts: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/blog/posts');
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(prev => ({ ...prev, posts: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, posts: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };
  
  // Fetch settings
  const fetchSettings = async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    setError(prev => ({ ...prev, settings: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/blog/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(prev => ({ ...prev, settings: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, settings: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };
  
  // Fetch content calendar
  const fetchCalendar = async () => {
    setLoading(prev => ({ ...prev, calendar: true }));
    setError(prev => ({ ...prev, calendar: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/blog/content-calendar?weeks=4');
      const data = await response.json();
      
      if (data.success) {
        setCalendar(data.calendar);
      } else {
        setError(prev => ({ ...prev, calendar: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, calendar: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, calendar: false }));
    }
  };
  
  // Generate topic suggestions
  const generateTopics = async () => {
    setLoading(prev => ({ ...prev, generation: true }));
    setError(prev => ({ ...prev, generation: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/blog/topics/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generationOptions)
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchTopics(); // Refresh topics list
        setError(prev => ({ ...prev, generation: null }));
      } else {
        setError(prev => ({ ...prev, generation: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, generation: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, generation: false }));
    }
  };
  
  // Generate blog post from topic
  const generateBlogPost = async (topicId) => {
    setLoading(prev => ({ ...prev, generation: true }));
    setError(prev => ({ ...prev, generation: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch(`/api/blog/topics/${topicId}/generate`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchTopics(); // Refresh topics list
        fetchPosts(); // Refresh posts list
        setError(prev => ({ ...prev, generation: null }));
      } else {
        setError(prev => ({ ...prev, generation: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, generation: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, generation: false }));
    }
  };
  
  // Review blog post
  const reviewBlogPost = async (postId) => {
    setLoading(prev => ({ ...prev, generation: true }));
    setError(prev => ({ ...prev, generation: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch(`/api/blog/posts/${postId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchPosts(); // Refresh posts list
        setSelectedPost(null);
        setReviewForm({
          status: 'approved',
          notes: '',
          publishNow: false,
          content: ''
        });
        setError(prev => ({ ...prev, generation: null }));
      } else {
        setError(prev => ({ ...prev, generation: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, generation: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, generation: false }));
    }
  };
  
  // Generate images for blog post
  const generateImages = async (postId) => {
    setLoading(prev => ({ ...prev, generation: true }));
    setError(prev => ({ ...prev, generation: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch(`/api/blog/posts/${postId}/images`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchPosts(); // Refresh posts list
        setError(prev => ({ ...prev, generation: null }));
      } else {
        setError(prev => ({ ...prev, generation: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, generation: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, generation: false }));
    }
  };
  
  // Save settings
  const saveSettings = async () => {
    setLoading(prev => ({ ...prev, settings: true }));
    setError(prev => ({ ...prev, settings: null }));
    
    try {
      // This would be a real API call in production
      const response = await fetch('/api/blog/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        setError(prev => ({ ...prev, settings: null }));
      } else {
        setError(prev => ({ ...prev, settings: data.message }));
      }
    } catch (err) {
      setError(prev => ({ ...prev, settings: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Topic columns for data grid
  const topicColumns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'contentType', headerName: 'Type', width: 150,
      renderCell: (params) => {
        const typeLabels = {
          'product': 'Product',
          'industry_news': 'Industry News',
          'how_to': 'How-To Guide',
          'case_study': 'Case Study'
        };
        return typeLabels[params.value] || params.value;
      }
    },
    { field: 'status', headerName: 'Status', width: 150,
      renderCell: (params) => {
        const statusColors = {
          'suggested': 'default',
          'approved': 'success',
          'rejected': 'error',
          'in_progress': 'warning',
          'completed': 'info'
        };
        return (
          <Chip 
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1).replace('_', ' ')} 
            color={statusColors[params.value] || 'default'} 
            size="small" 
          />
        );
      }
    },
    { field: 'primaryKeyword', headerName: 'Primary Keyword', width: 200 },
    { field: 'createdAt', headerName: 'Created', width: 180,
      renderCell: (params) => format(new Date(params.value), 'MMM d, yyyy h:mm a')
    },
    { field: 'actions', headerName: 'Actions', width: 200,
      renderCell: (params) => (
        <Box>
          <Button 
            size="small" 
            startIcon={<Edit />} 
            onClick={() => {
              setSelectedTopic(params.row);
              setTopicForm({
                title: params.row.title,
                description: params.row.description,
                contentType: params.row.contentType,
                primaryKeyword: params.row.primaryKeyword,
                secondaryKeywords: params.row.secondaryKeywords || [],
                status: params.row.status
              });
              setIsEditing(true);
            }}
          >
            Edit
          </Button>
          {params.row.status === 'approved' && !params.row.blogPost && (
            <Button 
              size="small" 
              color="primary" 
              startIcon={<Add />} 
              onClick={() => generateBlogPost(params.row._id)}
              disabled={loading.generation}
            >
              Generate
            </Button>
          )}
        </Box>
      )
    }
  ];
  
  // Post columns for data grid
  const postColumns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'contentType', headerName: 'Type', width: 150,
      renderCell: (params) => {
        const typeLabels = {
          'product': 'Product',
          'industry_news': 'Industry News',
          'how_to': 'How-To Guide',
          'case_study': 'Case Study'
        };
        return typeLabels[params.value] || params.value;
      }
    },
    { field: 'status', headerName: 'Status', width: 150,
      renderCell: (params) => {
        const statusColors = {
          'draft': 'default',
          'review': 'warning',
          'scheduled': 'info',
          'published': 'success',
          'archived': 'error'
        };
        return (
          <Chip 
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
            color={statusColors[params.value] || 'default'} 
            size="small" 
          />
        );
      }
    },
    { field: 'automation.reviewStatus', headerName: 'Review', width: 150,
      valueGetter: (params) => params.row.automation?.reviewStatus || 'N/A',
      renderCell: (params) => {
        if (params.value === 'N/A') return 'N/A';
        
        const statusColors = {
          'pending': 'warning',
          'reviewed': 'info',
          'approved': 'success',
          'rejected': 'error'
        };
        return (
          <Chip 
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
            color={statusColors[params.value] || 'default'} 
            size="small" 
          />
        );
      }
    },
    { field: 'createdAt', headerName: 'Created', width: 180,
      renderCell: (params) => format(new Date(params.value), 'MMM d, yyyy h:mm a')
    },
    { field: 'publishedAt', headerName: 'Published', width: 180,
      renderCell: (params) => params.value ? format(new Date(params.value), 'MMM d, yyyy h:mm a') : 'Not published'
    },
    { field: 'actions', headerName: 'Actions', width: 250,
      renderCell: (params) => (
        <Box>
          <Button 
            size="small" 
            startIcon={<Edit />} 
            onClick={() => {
              setSelectedPost(params.row);
              setPostForm({
                title: params.row.title,
                content: params.row.content,
                excerpt: params.row.excerpt,
                contentType: params.row.contentType,
                status: params.row.status,
                seo: params.row.seo || {
                  metaTitle: '',
                  metaDescription: '',
                  focusKeyword: ''
                }
              });
              setReviewForm({
                status: 'approved',
                notes: '',
                publishNow: false,
                content: params.row.content
              });
              setIsEditing(true);
            }}
          >
            View
          </Button>
          {params.row.status === 'draft' && params.row.automation?.isAutoGenerated && (
            <Button 
              size="small" 
              color="primary" 
              startIcon={<Image />} 
              onClick={() => generateImages(params.row._id)}
              disabled={loading.generation}
            >
              Images
            </Button>
          )}
          {params.row.status === 'published' && !params.row.automation?.emailPromoted && (
            <Button 
              size="small" 
              color="primary" 
              startIcon={<Email />} 
              onClick={() => {
                // This would be a real API call in production
                fetch(`/api/blog/posts/${params.row._id}/promote`, {
                  method: 'POST'
                });
                fetchPosts();
              }}
            >
              Promote
            </Button>
          )}
        </Box>
      )
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Blog Automation Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="blog management tabs">
          <Tab label="Dashboard" id="tab-0" />
          <Tab label="Topics" id="tab-1" />
          <Tab label="Posts" id="tab-2" />
          <Tab label="Calendar" id="tab-3" />
          <Tab label="Settings" id="tab-4" />
        </Tabs>
      </Box>
      
      {/* Dashboard Tab */}
      <div role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Blog Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="body2">Total Topics</Typography>
                      <Typography variant="h4">{topics.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
                      <Typography variant="body2">Total Posts</Typography>
                      <Typography variant="h4">{posts.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                      <Typography variant="body2">Published</Typography>
                      <Typography variant="h4">
                        {posts.filter(post => post.status === 'published').length}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
                      <Typography variant="body2">Pending Review</Typography>
                      <Typography variant="h4">
                        {posts.filter(post => post.automation?.reviewStatus === 'pending').length}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      startIcon={<Add />}
                      onClick={generateTopics}
                      disabled={loading.generation}
                    >
                      Generate Topic Suggestions
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      fullWidth 
                      startIcon={<Schedule />}
                      onClick={() => {
                        // This would be a real API call in production
                        fetch('/api/blog/publish-scheduled', {
                          method: 'POST'
                        });
                        fetchPosts();
                      }}
                    >
                      Publish Scheduled Posts
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      color="info" 
                      fullWidth 
                      startIcon={<Email />}
                      onClick={() => {
                        // This would be a real API call in production
                        fetch('/api/blog/promote-via-email', {
                          method: 'POST'
                        });
                        fetchPosts();
                      }}
                    >
                      Run Email Promotions
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<Refresh />}
                      onClick={() => {
                        fetchTopics();
                        fetchPosts();
                        fetchCalendar();
                      }}
                    >
                      Refresh All Data
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ height: 400 }}>
                  <DataGrid
                    rows={[...posts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5).map(post => ({
                      id: post._id,
                      ...post
                    }))}
                    columns={[
                      { field: 'title', headerName: 'Title', flex: 1 },
                      { field: 'status', headerName: 'Status', width: 150,
                        renderCell: (params) => {
                          const statusColors = {
                            'draft': 'default',
                            'review': 'warning',
                            'scheduled': 'info',
                            'published': 'success',
                            'archived': 'error'
                          };
                          return (
                            <Chip 
                              label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
                              color={statusColors[params.value] || 'default'} 
                              size="small" 
                            />
                          );
                        }
                      },
                      { field: 'updatedAt', headerName: 'Last Updated', width: 200,
                        renderCell: (params) => format(new Date(params.value), 'MMM d, yyyy h:mm a')
                      },
                      { field: 'actions', headerName: 'Actions', width: 150,
                        renderCell: (params) => (
                          <Button 
                            size="small" 
                            startIcon={<Edit />} 
                            onClick={() => {
                              setSelectedPost(params.row);
                              setPostForm({
                                title: params.row.title,
                                content: params.row.content,
                                excerpt: params.row.excerpt,
                                contentType: params.row.contentType,
                                status: params.row.status,
                                seo: params.row.seo || {
                                  metaTitle: '',
                                  metaDescription: '',
                                  focusKeyword: ''
                                }
                              });
                              setTabValue(2); // Switch to Posts tab
                              setIsEditing(true);
                            }}
                          >
                            View
                          </Button>
                        )
                      }
                    ]}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </div>
      
      {/* Topics Tab */}
      <div role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <div>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Blog Topics</Typography>
              <Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  onClick={() => {
                    setSelectedTopic(null);
                    setTopicForm({
                      title: '',
                      description: '',
                      contentType: 'product',
                      primaryKeyword: '',
                      secondaryKeywords: [],
                      status: 'suggested'
                    });
                    setIsEditing(true);
                  }}
                  sx={{ mr: 2 }}
                >
                  New Topic
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Refresh />}
                  onClick={fetchTopics}
                  disabled={loading.topics}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
            
            {error.topics && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.topics}
              </Alert>
            )}
            
            {error.generation && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.generation}
              </Alert>
            )}
            
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Generate Topic Suggestions
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Number of Topics"
                    type="number"
                    value={generationOptions.count}
                    onChange={(e) => setGenerationOptions(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    fullWidth
                    InputProps={{ inputProps: { min: 1, max: 20 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Content Types</InputLabel>
                    <Select
                      multiple
                      value={generationOptions.contentTypes}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, contentTypes: e.target.value }))}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                              size="small" 
                            />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="product">Product</MenuItem>
                      <MenuItem value="industry_news">Industry News</MenuItem>
                      <MenuItem value="how_to">How-To Guide</MenuItem>
                      <MenuItem value="case_study">Case Study</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={generateTopics}
                    disabled={loading.generation}
                    startIcon={loading.generation ? <CircularProgress size={20} color="inherit" /> : <Add />}
                  >
                    Generate Topics
                  </Button>
                </Grid>
              </Grid>
            </Paper>
            
            <Box sx={{ height: 600 }}>
              {loading.topics ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <DataGrid
                  rows={topics.map(topic => ({
                    id: topic._id,
                    ...topic
                  }))}
                  columns={topicColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                />
              )}
            </Box>
            
            {/* Topic Edit Dialog */}
            {isEditing && (
              <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedTopic ? 'Edit Topic' : 'New Topic'}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Title"
                      value={topicForm.title}
                      onChange={(e) => setTopicForm(prev => ({ ...prev, title: e.target.value }))}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      value={topicForm.description}
                      onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                      fullWidth
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Content Type</InputLabel>
                      <Select
                        value={topicForm.contentType}
                        onChange={(e) => setTopicForm(prev => ({ ...prev, contentType: e.target.value }))}
                      >
                        <MenuItem value="product">Product</MenuItem>
                        <MenuItem value="industry_news">Industry News</MenuItem>
                        <MenuItem value="how_to">How-To Guide</MenuItem>
                        <MenuItem value="case_study">Case Study</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={topicForm.status}
                        onChange={(e) => setTopicForm(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <MenuItem value="suggested">Suggested</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Primary Keyword"
                      value={topicForm.primaryKeyword}
                      onChange={(e) => setTopicForm(prev => ({ ...prev, primaryKeyword: e.target.value }))}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Secondary Keywords (comma separated)"
                      value={topicForm.secondaryKeywords.join(', ')}
                      onChange={(e) => setTopicForm(prev => ({ 
                        ...prev, 
                        secondaryKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                      }))}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                          // This would be a real API call in production
                          if (selectedTopic) {
                            fetch(`/api/blog/topics/${selectedTopic._id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify(topicForm)
                            });
                          } else {
                            fetch('/api/blog/topics', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify(topicForm)
                            });
                          }
                          
                          // Refresh topics list
                          fetchTopics();
                          setIsEditing(false);
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </div>
        )}
      </div>
      
      {/* Posts Tab */}
      <div role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <div>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Blog Posts</Typography>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={fetchPosts}
                disabled={loading.posts}
              >
                Refresh
              </Button>
            </Box>
            
            {error.posts && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.posts}
              </Alert>
            )}
            
            <Box sx={{ height: 600 }}>
              {loading.posts ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <DataGrid
                  rows={posts.map(post => ({
                    id: post._id,
                    ...post
                  }))}
                  columns={postColumns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                />
              )}
            </Box>
            
            {/* Post View/Edit Dialog */}
            {isEditing && selectedPost && (
              <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedPost.title}
                </Typography>
                
                <Tabs value={0} aria-label="post tabs">
                  <Tab label="Content" id="post-tab-0" />
                  <Tab label="SEO" id="post-tab-1" />
                  <Tab label="Review" id="post-tab-2" />
                </Tabs>
                
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Content Preview
                      </Typography>
                      <Paper elevation={1} sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                        <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Review and Approve
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Review Decision</InputLabel>
                            <Select
                              value={reviewForm.status}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                            >
                              <MenuItem value="approved">Approve</MenuItem>
                              <MenuItem value="rejected">Reject</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={reviewForm.publishNow}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, publishNow: e.target.checked }))}
                                disabled={reviewForm.status !== 'approved'}
                              />
                            }
                            label="Publish immediately"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Review Notes"
                            value={reviewForm.notes}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, notes: e.target.value }))}
                            fullWidth
                            multiline
                            rows={3}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button 
                              variant="outlined" 
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="contained" 
                              color={reviewForm.status === 'approved' ? 'success' : 'error'}
                              startIcon={reviewForm.status === 'approved' ? <CheckCircle /> : <Cancel />}
                              onClick={() => reviewBlogPost(selectedPost._id)}
                              disabled={loading.generation}
                            >
                              {reviewForm.status === 'approved' ? 'Approve' : 'Reject'}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            )}
          </div>
        )}
      </div>
      
      {/* Calendar Tab */}
      <div role="tabpanel" hidden={tabValue !== 3}>
        {tabValue === 3 && (
          <div>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Content Calendar</Typography>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={fetchCalendar}
                disabled={loading.calendar}
              >
                Refresh
              </Button>
            </Box>
            
            {error.calendar && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.calendar}
              </Alert>
            )}
            
            {loading.calendar ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : calendar ? (
              <div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={new Date(calendar.startDate)}
                      onChange={(newValue) => {
                        fetchCalendar(`/api/blog/content-calendar?startDate=${newValue.toISOString()}`);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Weeks</InputLabel>
                      <Select
                        value="4"
                        label="Weeks"
                        onChange={(e) => {
                          fetchCalendar(`/api/blog/content-calendar?weeks=${e.target.value}`);
                        }}
                      >
                        <MenuItem value="2">2 Weeks</MenuItem>
                        <MenuItem value="4">4 Weeks</MenuItem>
                        <MenuItem value="8">8 Weeks</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </LocalizationProvider>
                
                {calendar.weeks.map((week, weekIndex) => (
                  <Paper key={weekIndex} elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Week {week.weekNumber}: {format(new Date(week.startDate), 'MMM d')} - {format(new Date(week.endDate), 'MMM d, yyyy')}
                    </Typography>
                    <Grid container spacing={2}>
                      {week.days.map((day, dayIndex) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={dayIndex}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              height: '100%',
                              bgcolor: day.isPublishingDay ? 'rgba(0, 150, 136, 0.1)' : 'inherit',
                              border: day.isPublishingDay ? '1px solid #00968880' : 'inherit'
                            }}
                          >
                            <Typography variant="subtitle1" gutterBottom>
                              {format(new Date(day.date), 'EEE, MMM d')}
                            </Typography>
                            {day.posts.length > 0 ? (
                              <div>
                                {day.posts.map((post, postIndex) => (
                                  <Box key={postIndex} sx={{ mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="body2" noWrap title={post.title}>
                                      {post.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                      <Chip 
                                        label={post.type} 
                                        size="small" 
                                        color={post.type === 'scheduled' ? 'primary' : 'secondary'} 
                                      />
                                      {post.type === 'suggested' && (
                                        <Button 
                                          size="small" 
                                          variant="outlined" 
                                          onClick={() => {
                                            // This would be a real API call in production
                                            fetch(`/api/blog/topics/${post.id}/generate`, {
                                              method: 'POST'
                                            });
                                            fetchCalendar();
                                          }}
                                        >
                                          Generate
                                        </Button>
                                      )}
                                    </Box>
                                  </Box>
                                ))}
                              </div>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No posts scheduled
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ))}
              </div>
            ) : (
              <Alert severity="info">
                No calendar data available. Click Refresh to load the content calendar.
              </Alert>
            )}
          </div>
        )}
      </div>
      
      {/* Settings Tab */}
      <div role="tabpanel" hidden={tabValue !== 4}>
        {tabValue === 4 && (
          <div>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Blog Automation Settings</Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={saveSettings}
                disabled={loading.settings || !settings}
              >
                Save Settings
              </Button>
            </Box>
            
            {error.settings && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.settings}
              </Alert>
            )}
            
            {loading.settings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
              </Box>
            ) : settings ? (
              <div>
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Content Generation Settings
                  </Typography>
                  <Grid container spacing={3}>
                    {Object.keys(settings.contentTypes).map((type) => (
                      <Grid item xs={12} sm={6} md={3} key={type}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.contentTypes[type].enabled}
                                onChange={(e) => {
                                  const updatedSettings = { ...settings };
                                  updatedSettings.contentTypes[type].enabled = e.target.checked;
                                  setSettings(updatedSettings);
                                }}
                              />
                            }
                            label="Enabled"
                          />
                          <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Frequency</InputLabel>
                            <Select
                              value={settings.contentTypes[type].frequency}
                              onChange={(e) => {
                                const updatedSettings = { ...settings };
                                updatedSettings.contentTypes[type].frequency = e.target.value;
                                setSettings(updatedSettings);
                              }}
                            >
                              <MenuItem value="daily">Daily</MenuItem>
                              <MenuItem value="weekly">Weekly</MenuItem>
                              <MenuItem value="biweekly">Bi-Weekly</MenuItem>
                              <MenuItem value="monthly">Monthly</MenuItem>
                            </Select>
                          </FormControl>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
                
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Publishing Schedule
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Publishing Days</InputLabel>
                        <Select
                          multiple
                          value={settings.publishingSchedule.daysOfWeek}
                          onChange={(e) => {
                            const updatedSettings = { ...settings };
                            updatedSettings.publishingSchedule.daysOfWeek = e.target.value;
                            setSettings(updatedSettings);
                          }}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                return (
                                  <Chip key={value} label={days[value]} size="small" />
                                );
                              })}
                            </Box>
                          )}
                        >
                          <MenuItem value={0}>Sunday</MenuItem>
                          <MenuItem value={1}>Monday</MenuItem>
                          <MenuItem value={2}>Tuesday</MenuItem>
                          <MenuItem value={3}>Wednesday</MenuItem>
                          <MenuItem value={4}>Thursday</MenuItem>
                          <MenuItem value={5}>Friday</MenuItem>
                          <MenuItem value={6}>Saturday</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Publishing Time (HH:MM)"
                        value={settings.publishingSchedule.timeOfDay}
                        onChange={(e) => {
                          const updatedSettings = { ...settings };
                          updatedSettings.publishingSchedule.timeOfDay = e.target.value;
                          setSettings(updatedSettings);
                        }}
                        fullWidth
                        type="time"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Maximum Posts Per Week"
                        value={settings.publishingSchedule.maxPostsPerWeek}
                        onChange={(e) => {
                          const updatedSettings = { ...settings };
                          updatedSettings.publishingSchedule.maxPostsPerWeek = parseInt(e.target.value);
                          setSettings(updatedSettings);
                        }}
                        fullWidth
                        type="number"
                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Minimum Days Between Posts"
                        value={settings.publishingSchedule.minDaysBetweenPosts}
                        onChange={(e) => {
                          const updatedSettings = { ...settings };
                          updatedSettings.publishingSchedule.minDaysBetweenPosts = parseInt(e.target.value);
                          setSettings(updatedSettings);
                        }}
                        fullWidth
                        type="number"
                        InputProps={{ inputProps: { min: 1, max: 7 } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Review Workflow
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.reviewWorkflow.requireReview}
                            onChange={(e) => {
                              const updatedSettings = { ...settings };
                              updatedSettings.reviewWorkflow.requireReview = e.target.checked;
                              setSettings(updatedSettings);
                            }}
                          />
                        }
                        label="Require Review Before Publishing"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.reviewWorkflow.autoPublishAfterApproval}
                            onChange={(e) => {
                              const updatedSettings = { ...settings };
                              updatedSettings.reviewWorkflow.autoPublishAfterApproval = e.target.checked;
                              setSettings(updatedSettings);
                            }}
                          />
                        }
                        label="Auto-Publish After Approval"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.reviewWorkflow.notifyReviewersEmail}
                            onChange={(e) => {
                              const updatedSettings = { ...settings };
                              updatedSettings.reviewWorkflow.notifyReviewersEmail = e.target.checked;
                              setSettings(updatedSettings);
                            }}
                          />
                        }
                        label="Notify Reviewers via Email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Review Reminder (days)"
                        value={settings.reviewWorkflow.reviewReminderDays}
                        onChange={(e) => {
                          const updatedSettings = { ...settings };
                          updatedSettings.reviewWorkflow.reviewReminderDays = parseInt(e.target.value);
                          setSettings(updatedSettings);
                        }}
                        fullWidth
                        type="number"
                        InputProps={{ inputProps: { min: 1, max: 7 } }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Email Promotion
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailPromotion.enabled}
                            onChange={(e) => {
                              const updatedSettings = { ...settings };
                              updatedSettings.emailPromotion.enabled = e.target.checked;
                              setSettings(updatedSettings);
                            }}
                          />
                        }
                        label="Enable Email Promotion"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Promotion Delay (days after publishing)"
                        value={settings.emailPromotion.promotionDelay}
                        onChange={(e) => {
                          const updatedSettings = { ...settings };
                          updatedSettings.emailPromotion.promotionDelay = parseInt(e.target.value);
                          setSettings(updatedSettings);
                        }}
                        fullWidth
                        type="number"
                        InputProps={{ inputProps: { min: 0, max: 14 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailPromotion.includeInNewsletter}
                            onChange={(e) => {
                              const updatedSettings = { ...settings };
                              updatedSettings.emailPromotion.includeInNewsletter = e.target.checked;
                              setSettings(updatedSettings);
                            }}
                          />
                        }
                        label="Include in Newsletter"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.emailPromotion.dedicatedEmailForFeatured}
                            onChange={(e) => {
                              const updatedSettings = { ...settings };
                              updatedSettings.emailPromotion.dedicatedEmailForFeatured = e.target.checked;
                              setSettings(updatedSettings);
                            }}
                          />
                        }
                        label="Dedicated Email for Featured Posts"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </div>
            ) : (
              <Alert severity="info">
                No settings data available. Click Refresh to load settings.
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
