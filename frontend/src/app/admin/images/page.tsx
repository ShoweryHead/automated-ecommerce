'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Image as ImageIcon, Upload, Settings, RefreshCw, Search, PlusCircle, Trash2, Edit, Eye } from "lucide-react";

export default function ImageAutomationPage() {
  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalImages: 0,
    productImages: 0,
    blogImages: 0,
    categoryImages: 0,
    socialImages: 0,
    aiGenerated: 0,
    stockImages: 0,
    optimizedImages: 0
  });

  // State for image list
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for image filters
  const [filters, setFilters] = useState({
    type: '',
    status: 'active',
    sourceType: '',
    entityType: ''
  });

  // State for image automation settings
  const [settings, setSettings] = useState({
    enabled: true,
    imageTypes: {
      product: {
        enabled: true,
        preferredSource: 'hybrid',
        dimensions: { width: 800, height: 800 },
        maxImagesPerProduct: 5,
        styleKeywords: ['professional', 'clean', 'industrial', 'detailed', 'machinery']
      },
      blog: {
        enabled: true,
        preferredSource: 'stock',
        dimensions: { width: 1200, height: 630 },
        maxImagesPerPost: 3,
        styleKeywords: ['informative', 'professional', 'industrial', 'technical', 'clean']
      },
      category: {
        enabled: true,
        preferredSource: 'stock',
        dimensions: { width: 1600, height: 400 },
        styleKeywords: ['panoramic', 'industrial', 'professional', 'machinery', 'wide']
      },
      social: {
        enabled: true,
        preferredSource: 'ai_generated',
        dimensions: { width: 1200, height: 630 },
        styleKeywords: ['engaging', 'professional', 'clean', 'promotional', 'eye-catching']
      }
    },
    stockImageAPI: {
      provider: 'unsplash',
      searchParams: {
        defaultQuery: 'coating machine industrial',
        orientation: 'any',
        safeSearch: true,
        maxResults: 10
      }
    },
    aiGenerationAPI: {
      provider: 'openai',
      model: 'dall-e-3',
      defaultPromptTemplate: 'A professional, clean, high-quality image of {subject} with an industrial aesthetic. The image should be well-lit, with a clean background, showing {subject} in detail.',
      stylePreset: 'photographic',
      negativePrompt: 'text, watermarks, low quality, blurry, distorted'
    },
    optimization: {
      enabled: true,
      compressionLevel: 80,
      preferredFormat: 'webp',
      convertToWebP: true,
      generateResponsiveSizes: true,
      stripExif: true
    },
    seo: {
      generateAltText: true,
      altTextTemplate: '{product_name} - {category_name} - high quality industrial coating machine',
      includeKeywordsInFilename: true,
      filenameTemplate: '{entity_type}-{entity_name}-{timestamp}'
    },
    styleGuidelines: {
      colorPalette: [
        { name: 'primary', hexCode: '#0056b3' },
        { name: 'secondary', hexCode: '#6c757d' },
        { name: 'accent', hexCode: '#ffc107' },
        { name: 'light', hexCode: '#f8f9fa' },
        { name: 'dark', hexCode: '#343a40' }
      ],
      preferredStyle: 'professional, clean, industrial',
      avoidStyles: 'cartoon, abstract, low quality',
      backgroundPreference: 'white'
    }
  });

  // State for image sourcing form
  const [sourcingForm, setSourcingForm] = useState({
    type: 'product',
    entityType: 'product',
    entityName: '',
    keywords: '',
    sourceMethod: '',
    width: 800,
    height: 600,
    prompt: ''
  });

  // State for batch processing form
  const [batchForm, setBatchForm] = useState({
    action: 'optimize',
    type: '',
    status: 'active',
    optimizationStatus: 'unoptimized',
    sourceType: '',
    limit: 10
  });

  // State for selected image
  const [selectedImage, setSelectedImage] = useState(null);

  // State for upload form
  const [uploadForm, setUploadForm] = useState({
    file: null,
    type: 'product',
    entityType: '',
    entityId: '',
    altText: '',
    title: '',
    caption: '',
    optimize: true
  });

  // Mock function to fetch images
  const fetchImages = async () => {
    setLoading(true);
    // In a real implementation, this would call the API
    // For this example, we'll simulate a successful response
    setTimeout(() => {
      const mockImages = [
        {
          _id: '1',
          filename: 'product-coating-machine-123456.webp',
          url: '/images/products/product-coating-machine-123456.webp',
          type: 'product',
          metadata: { width: 800, height: 800, format: 'webp', size: 51200 },
          source: { type: 'ai_generated', provider: 'openai' },
          seo: { altText: 'Powder Coating Machine - high quality industrial equipment' },
          relatedTo: { entityType: 'product', entityName: 'Powder Coating Machine' },
          status: 'active',
          createdAt: '2025-04-15T07:30:00.000Z'
        },
        {
          _id: '2',
          filename: 'blog-coating-industry-trends-123456.webp',
          url: '/images/blog/blog-coating-industry-trends-123456.webp',
          type: 'blog',
          metadata: { width: 1200, height: 630, format: 'webp', size: 76800 },
          source: { type: 'stock', provider: 'unsplash' },
          seo: { altText: 'Coating Industry Trends - industrial manufacturing' },
          relatedTo: { entityType: 'blog', entityName: 'Coating Industry Trends 2025' },
          status: 'active',
          createdAt: '2025-04-14T15:45:00.000Z'
        },
        {
          _id: '3',
          filename: 'category-powder-coating-equipment-123456.webp',
          url: '/images/categories/category-powder-coating-equipment-123456.webp',
          type: 'category',
          metadata: { width: 1600, height: 400, format: 'webp', size: 102400 },
          source: { type: 'stock', provider: 'pexels' },
          seo: { altText: 'Powder Coating Equipment Category - industrial machinery' },
          relatedTo: { entityType: 'category', entityName: 'Powder Coating Equipment' },
          status: 'active',
          createdAt: '2025-04-13T09:20:00.000Z'
        }
      ];
      
      setImages(mockImages);
      setTotalPages(3);
      setLoading(false);
      
      // Update stats
      setStats({
        totalImages: 42,
        productImages: 25,
        blogImages: 10,
        categoryImages: 5,
        socialImages: 2,
        aiGenerated: 18,
        stockImages: 24,
        optimizedImages: 38
      });
    }, 500);
  };

  // Mock function to fetch settings
  const fetchSettings = async () => {
    // In a real implementation, this would call the API
    // For this example, we'll use the default settings
    console.log('Fetching settings...');
  };

  // Mock function to save settings
  const saveSettings = async () => {
    // In a real implementation, this would call the API
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  // Mock function to source an image
  const sourceImage = async () => {
    // In a real implementation, this would call the API
    console.log('Sourcing image with options:', sourcingForm);
    alert(`Image sourced successfully for ${sourcingForm.entityName}!`);
    fetchImages();
  };

  // Mock function to batch process images
  const batchProcessImages = async () => {
    // In a real implementation, this would call the API
    console.log('Batch processing images with options:', batchForm);
    alert(`Batch processing started for ${batchForm.limit} images!`);
    fetchImages();
  };

  // Mock function to upload an image
  const uploadImage = async (e) => {
    e.preventDefault();
    // In a real implementation, this would call the API
    console.log('Uploading image:', uploadForm);
    alert('Image uploaded successfully!');
    setUploadForm({
      file: null,
      type: 'product',
      entityType: '',
      entityId: '',
      altText: '',
      title: '',
      caption: '',
      optimize: true
    });
    fetchImages();
  };

  // Mock function to optimize an image
  const optimizeImage = async (imageId) => {
    // In a real implementation, this would call the API
    console.log('Optimizing image:', imageId);
    alert('Image optimized successfully!');
    fetchImages();
  };

  // Mock function to generate alt text
  const generateAltText = async (imageId) => {
    // In a real implementation, this would call the API
    console.log('Generating alt text for image:', imageId);
    alert('Alt text generated successfully!');
    fetchImages();
  };

  // Mock function to delete an image
  const deleteImage = async (imageId) => {
    // In a real implementation, this would call the API
    if (confirm('Are you sure you want to delete this image?')) {
      console.log('Deleting image:', imageId);
      alert('Image deleted successfully!');
      fetchImages();
    }
  };

  // Effect to fetch images and settings on component mount
  useEffect(() => {
    fetchImages();
    fetchSettings();
  }, []);

  // Effect to fetch images when page or filters change
  useEffect(() => {
    fetchImages();
  }, [page, filters]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Automation</h1>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="source">Source Images</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Images</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalImages}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">By Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">Product: <span className="font-bold">{stats.productImages}</span></p>
                    <p className="text-sm">Blog: <span className="font-bold">{stats.blogImages}</span></p>
                  </div>
                  <div>
                    <p className="text-sm">Category: <span className="font-bold">{stats.categoryImages}</span></p>
                    <p className="text-sm">Social: <span className="font-bold">{stats.socialImages}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">By Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm">AI Generated: <span className="font-bold">{stats.aiGenerated}</span></p>
                  </div>
                  <div>
                    <p className="text-sm">Stock: <span className="font-bold">{stats.stockImages}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Optimized: <span className="font-bold">{stats.optimizedImages}</span></p>
                <p className="text-sm">Unoptimized: <span className="font-bold">{stats.totalImages - stats.optimizedImages}</span></p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(stats.optimizedImages / stats.totalImages) * 100}%` }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Images</CardTitle>
                <CardDescription>Recently added or generated images</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {images.map((image) => (
                        <TableRow key={image._id}>
                          <TableCell>
                            <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                              {/* In a real implementation, this would display the actual image */}
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={16} />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              image.type === 'product' ? 'default' :
                              image.type === 'blog' ? 'secondary' :
                              image.type === 'category' ? 'outline' : 'destructive'
                            }>
                              {image.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              image.source.type === 'ai_generated' ? 'default' :
                              image.source.type === 'stock' ? 'secondary' : 'outline'
                            }>
                              {image.source.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(image.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => fetchImages()}>Refresh</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common image automation tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button className="w-full mb-2" onClick={() => {
                    setSourcingForm({
                      ...sourcingForm,
                      type: 'product',
                      entityType: 'product'
                    });
                    document.querySelector('[data-value="source"]').click();
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Source Product Images
                  </Button>
                  
                  <Button className="w-full mb-2" onClick={() => {
                    setSourcingForm({
                      ...sourcingForm,
                      type: 'blog',
                      entityType: 'blog'
                    });
                    document.querySelector('[data-value="source"]').click();
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Source Blog Images
                  </Button>
                  
                  <Button className="w-full mb-2" onClick={() => {
                    setBatchForm({
                      ...batchForm,
                      action: 'optimize',
                      optimizationStatus: 'unoptimized'
                    });
                    document.querySelector('[data-value="batch"]').click();
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Optimize Unoptimized Images
                  </Button>
                  
                  <Button className="w-full" onClick={() => {
                    setBatchForm({
                      ...batchForm,
                      action: 'generateAltText'
                    });
                    document.querySelector('[data-value="batch"]').click();
                  }}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Missing Alt Text
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Image Library</CardTitle>
              <CardDescription>Manage all images in the system</CardDescription>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div>
                  <Label htmlFor="filter-type">Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger id="filter-type" className="w-[180px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger id="filter-status" className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-source">Source</Label>
                  <Select value={filters.sourceType} onValueChange={(value) => setFilters({ ...filters, sourceType: value })}>
                    <SelectTrigger id="filter-source" className="w-[180px]">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sources</SelectItem>
                      <SelectItem value="ai_generated">AI Generated</SelectItem>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="uploaded">Uploaded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-entity">Entity Type</Label>
                  <Select value={filters.entityType} onValueChange={(value) => setFilters({ ...filters, entityType: value })}>
                    <SelectTrigger id="filter-entity" className="w-[180px]">
                      <SelectValue placeholder="All Entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Entities</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => setFilters({
                    type: '',
                    status: 'active',
                    sourceType: '',
                    entityType: ''
                  })}>
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading images...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                    {images.map((image) => (
                      <Card key={image._id} className="overflow-hidden">
                        <div className="aspect-square bg-gray-100 relative">
                          {/* In a real implementation, this would display the actual image */}
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={48} className="text-gray-400" />
                          </div>
                          
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Badge variant={
                              image.type === 'product' ? 'default' :
                              image.type === 'blog' ? 'secondary' :
                              image.type === 'category' ? 'outline' : 'destructive'
                            }>
                              {image.type}
                            </Badge>
                            
                            <Badge variant={
                              image.source.type === 'ai_generated' ? 'default' :
                              image.source.type === 'stock' ? 'secondary' : 'outline'
                            }>
                              {image.source.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <p className="text-sm font-medium truncate">{image.filename}</p>
                          <p className="text-xs text-gray-500 truncate">{image.seo.altText}</p>
                          
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                            <span>{image.metadata.width}x{image.metadata.height}</span>
                            <span>{(image.metadata.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedImage(image)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => optimizeImage(image._id)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="ghost" size="sm" onClick={() => generateAltText(image._id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="ghost" size="sm" onClick={() => deleteImage(image._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Showing {images.length} of {stats.totalImages} images
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-3xl">
                <CardHeader>
                  <CardTitle>Image Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setSelectedImage(null)}
                  >
                    &times;
                  </Button>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="aspect-square bg-gray-100 mb-4">
                        {/* In a real implementation, this would display the actual image */}
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={64} className="text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <Label>Filename</Label>
                          <p className="text-sm">{selectedImage.filename}</p>
                        </div>
                        
                        <div>
                          <Label>Dimensions</Label>
                          <p className="text-sm">{selectedImage.metadata.width}x{selectedImage.metadata.height}</p>
                        </div>
                        
                        <div>
                          <Label>Size</Label>
                          <p className="text-sm">{(selectedImage.metadata.size / 1024).toFixed(1)} KB</p>
                        </div>
                        
                        <div>
                          <Label>Format</Label>
                          <p className="text-sm">{selectedImage.metadata.format}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Type</Label>
                        <p className="text-sm">
                          <Badge variant={
                            selectedImage.type === 'product' ? 'default' :
                            selectedImage.type === 'blog' ? 'secondary' :
                            selectedImage.type === 'category' ? 'outline' : 'destructive'
                          }>
                            {selectedImage.type}
                          </Badge>
                        </p>
                      </div>
                      
                      <div>
                        <Label>Source</Label>
                        <p className="text-sm">
                          <Badge variant={
                            selectedImage.source.type === 'ai_generated' ? 'default' :
                            selectedImage.source.type === 'stock' ? 'secondary' : 'outline'
                          }>
                            {selectedImage.source.type}
                          </Badge>
                          {selectedImage.source.provider && ` (${selectedImage.source.provider})`}
                        </p>
                      </div>
                      
                      <div>
                        <Label>Related To</Label>
                        <p className="text-sm">
                          {selectedImage.relatedTo.entityType}: {selectedImage.relatedTo.entityName}
                        </p>
                      </div>
                      
                      <div>
                        <Label>Alt Text</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={selectedImage.seo.altText}
                            onChange={(e) => setSelectedImage({
                              ...selectedImage,
                              seo: { ...selectedImage.seo, altText: e.target.value }
                            })}
                          />
                          <Button variant="outline" size="sm" onClick={() => generateAltText(selectedImage._id)}>
                            Generate
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={selectedImage.status}
                          onValueChange={(value) => setSelectedImage({ ...selectedImage, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="deleted">Deleted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Created At</Label>
                        <p className="text-sm">{new Date(selectedImage.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setSelectedImage(null)}>
                    Cancel
                  </Button>
                  
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => optimizeImage(selectedImage._id)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Optimize
                    </Button>
                    
                    <Button onClick={() => {
                      alert('Image updated successfully!');
                      setSelectedImage(null);
                      fetchImages();
                    }}>
                      Save Changes
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Source Images Tab */}
        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>Source New Images</CardTitle>
              <CardDescription>Generate or source images for products, blog posts, categories, or social media</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source-type">Image Type</Label>
                    <Select
                      value={sourcingForm.type}
                      onValueChange={(value) => setSourcingForm({ ...sourcingForm, type: value })}
                    >
                      <SelectTrigger id="source-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="source-entity-type">Entity Type</Label>
                    <Select
                      value={sourcingForm.entityType}
                      onValueChange={(value) => setSourcingForm({ ...sourcingForm, entityType: value })}
                    >
                      <SelectTrigger id="source-entity-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="source-entity-name">Entity Name</Label>
                    <Input
                      id="source-entity-name"
                      placeholder="e.g., Powder Coating Machine"
                      value={sourcingForm.entityName}
                      onChange={(e) => setSourcingForm({ ...sourcingForm, entityName: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The name of the product, category, or blog post
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="source-keywords">Keywords</Label>
                    <Input
                      id="source-keywords"
                      placeholder="e.g., industrial, machinery, coating"
                      value={sourcingForm.keywords}
                      onChange={(e) => setSourcingForm({ ...sourcingForm, keywords: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated keywords to help find or generate relevant images
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source-method">Source Method</Label>
                    <Select
                      value={sourcingForm.sourceMethod}
                      onValueChange={(value) => setSourcingForm({ ...sourcingForm, sourceMethod: value })}
                    >
                      <SelectTrigger id="source-method">
                        <SelectValue placeholder="Use default from settings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Use default from settings</SelectItem>
                        <SelectItem value="stock">Stock Photo API</SelectItem>
                        <SelectItem value="ai_generated">AI Generation</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Try AI, fallback to Stock)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="source-width">Width</Label>
                      <Input
                        id="source-width"
                        type="number"
                        placeholder="Width in pixels"
                        value={sourcingForm.width}
                        onChange={(e) => setSourcingForm({ ...sourcingForm, width: parseInt(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="source-height">Height</Label>
                      <Input
                        id="source-height"
                        type="number"
                        placeholder="Height in pixels"
                        value={sourcingForm.height}
                        onChange={(e) => setSourcingForm({ ...sourcingForm, height: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="source-prompt">Custom Prompt (for AI generation)</Label>
                    <Textarea
                      id="source-prompt"
                      placeholder="Leave blank to use default prompt template from settings"
                      value={sourcingForm.prompt}
                      onChange={(e) => setSourcingForm({ ...sourcingForm, prompt: e.target.value })}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Custom prompt for AI image generation. Leave blank to use the default template.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button
                onClick={sourceImage}
                disabled={!sourcingForm.entityName}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Source Image
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Batch Processing Tab */}
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Process Images</CardTitle>
              <CardDescription>Perform operations on multiple images at once</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batch-action">Action</Label>
                    <Select
                      value={batchForm.action}
                      onValueChange={(value) => setBatchForm({ ...batchForm, action: value })}
                    >
                      <SelectTrigger id="batch-action">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optimize">Optimize Images</SelectItem>
                        <SelectItem value="generateAltText">Generate Alt Text</SelectItem>
                        <SelectItem value="delete">Delete Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-type">Image Type</Label>
                    <Select
                      value={batchForm.type}
                      onValueChange={(value) => setBatchForm({ ...batchForm, type: value })}
                    >
                      <SelectTrigger id="batch-type">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-status">Status</Label>
                    <Select
                      value={batchForm.status}
                      onValueChange={(value) => setBatchForm({ ...batchForm, status: value })}
                    >
                      <SelectTrigger id="batch-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="batch-optimization">Optimization Status</Label>
                    <Select
                      value={batchForm.optimizationStatus}
                      onValueChange={(value) => setBatchForm({ ...batchForm, optimizationStatus: value })}
                    >
                      <SelectTrigger id="batch-optimization">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="optimized">Optimized</SelectItem>
                        <SelectItem value="unoptimized">Unoptimized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-source">Source Type</Label>
                    <Select
                      value={batchForm.sourceType}
                      onValueChange={(value) => setBatchForm({ ...batchForm, sourceType: value })}
                    >
                      <SelectTrigger id="batch-source">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sources</SelectItem>
                        <SelectItem value="ai_generated">AI Generated</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="uploaded">Uploaded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-limit">Limit</Label>
                    <Input
                      id="batch-limit"
                      type="number"
                      value={batchForm.limit}
                      onChange={(e) => setBatchForm({ ...batchForm, limit: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum number of images to process in this batch
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button
                onClick={batchProcessImages}
                variant={batchForm.action === 'delete' ? 'destructive' : 'default'}
              >
                {batchForm.action === 'optimize' && <RefreshCw className="mr-2 h-4 w-4" />}
                {batchForm.action === 'generateAltText' && <Edit className="mr-2 h-4 w-4" />}
                {batchForm.action === 'delete' && <Trash2 className="mr-2 h-4 w-4" />}
                {batchForm.action === 'optimize' && 'Optimize Images'}
                {batchForm.action === 'generateAltText' && 'Generate Alt Text'}
                {batchForm.action === 'delete' && 'Delete Images'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
              <CardDescription>Upload your own images to the system</CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={uploadImage}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop an image, or click to browse
                      </p>
                      <Input
                        id="upload-file"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('upload-file').click()}
                      >
                        Browse Files
                      </Button>
                      
                      {uploadForm.file && (
                        <div className="mt-4 text-left">
                          <p className="text-sm font-medium">Selected File:</p>
                          <p className="text-sm text-gray-500">{uploadForm.file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadForm.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="upload-type">Image Type</Label>
                      <Select
                        value={uploadForm.type}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}
                      >
                        <SelectTrigger id="upload-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="upload-optimize"
                        checked={uploadForm.optimize}
                        onCheckedChange={(checked) => setUploadForm({ ...uploadForm, optimize: checked })}
                      />
                      <Label htmlFor="upload-optimize">Optimize image after upload</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="upload-entity-type">Entity Type (Optional)</Label>
                      <Select
                        value={uploadForm.entityType}
                        onValueChange={(value) => setUploadForm({ ...uploadForm, entityType: value })}
                      >
                        <SelectTrigger id="upload-entity-type">
                          <SelectValue placeholder="Select Entity Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="blog">Blog Post</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="upload-entity-id">Entity ID (Optional)</Label>
                      <Input
                        id="upload-entity-id"
                        placeholder="e.g., 60d21b4667d0d8992e610c85"
                        value={uploadForm.entityId}
                        onChange={(e) => setUploadForm({ ...uploadForm, entityId: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="upload-alt-text">Alt Text</Label>
                      <Input
                        id="upload-alt-text"
                        placeholder="Descriptive text for the image"
                        value={uploadForm.altText}
                        onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="upload-title">Title</Label>
                      <Input
                        id="upload-title"
                        placeholder="Image title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="upload-caption">Caption (Optional)</Label>
                      <Input
                        id="upload-caption"
                        placeholder="Image caption"
                        value={uploadForm.caption}
                        onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={!uploadForm.file}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Image Automation Settings</CardTitle>
              <CardDescription>Configure how images are sourced, generated, and optimized</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="image-types">Image Types</TabsTrigger>
                  <TabsTrigger value="stock-api">Stock API</TabsTrigger>
                  <TabsTrigger value="ai-generation">AI Generation</TabsTrigger>
                  <TabsTrigger value="optimization">Optimization</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="style">Style Guidelines</TabsTrigger>
                </TabsList>
                
                {/* General Settings */}
                <TabsContent value="general">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="settings-enabled" className="text-base">Enable Image Automation</Label>
                        <p className="text-sm text-gray-500">
                          Turn on/off all image automation features
                        </p>
                      </div>
                      <Switch
                        id="settings-enabled"
                        checked={settings.enabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Storage Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="settings-storage-type">Storage Type</Label>
                          <Select
                            value={settings.storage?.storageType || 'local'}
                            onValueChange={(value) => setSettings({
                              ...settings,
                              storage: { ...settings.storage, storageType: value }
                            })}
                          >
                            <SelectTrigger id="settings-storage-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="local">Local Storage</SelectItem>
                              <SelectItem value="s3">Amazon S3</SelectItem>
                              <SelectItem value="cloudinary">Cloudinary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-base-path">Base Path</Label>
                          <Input
                            id="settings-base-path"
                            value={settings.storage?.basePath || '/images'}
                            onChange={(e) => setSettings({
                              ...settings,
                              storage: { ...settings.storage, basePath: e.target.value }
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-folder-structure">Folder Structure</Label>
                          <Input
                            id="settings-folder-structure"
                            value={settings.storage?.folderStructure || '{type}/{entity_type}/{date}'}
                            onChange={(e) => setSettings({
                              ...settings,
                              storage: { ...settings.storage, folderStructure: e.target.value }
                            })}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Available variables: {'{type}'}, {'{entity_type}'}, {'{date}'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Image Types Settings */}
                <TabsContent value="image-types">
                  <div className="space-y-8">
                    {/* Product Images */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Product Images</h3>
                        <Switch
                          checked={settings.imageTypes.product.enabled}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            imageTypes: {
                              ...settings.imageTypes,
                              product: { ...settings.imageTypes.product, enabled: checked }
                            }
                          })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="settings-product-source">Preferred Source</Label>
                          <Select
                            value={settings.imageTypes.product.preferredSource}
                            onValueChange={(value) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                product: { ...settings.imageTypes.product, preferredSource: value }
                              }
                            })}
                          >
                            <SelectTrigger id="settings-product-source">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stock">Stock Photo API</SelectItem>
                              <SelectItem value="ai_generated">AI Generation</SelectItem>
                              <SelectItem value="hybrid">Hybrid (Try AI, fallback to Stock)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-product-max">Max Images Per Product</Label>
                          <Input
                            id="settings-product-max"
                            type="number"
                            value={settings.imageTypes.product.maxImagesPerProduct}
                            onChange={(e) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                product: {
                                  ...settings.imageTypes.product,
                                  maxImagesPerProduct: parseInt(e.target.value)
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-product-width">Width (px)</Label>
                          <Input
                            id="settings-product-width"
                            type="number"
                            value={settings.imageTypes.product.dimensions.width}
                            onChange={(e) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                product: {
                                  ...settings.imageTypes.product,
                                  dimensions: {
                                    ...settings.imageTypes.product.dimensions,
                                    width: parseInt(e.target.value)
                                  }
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-product-height">Height (px)</Label>
                          <Input
                            id="settings-product-height"
                            type="number"
                            value={settings.imageTypes.product.dimensions.height}
                            onChange={(e) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                product: {
                                  ...settings.imageTypes.product,
                                  dimensions: {
                                    ...settings.imageTypes.product.dimensions,
                                    height: parseInt(e.target.value)
                                  }
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor="settings-product-keywords">Style Keywords</Label>
                          <Input
                            id="settings-product-keywords"
                            value={settings.imageTypes.product.styleKeywords.join(', ')}
                            onChange={(e) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                product: {
                                  ...settings.imageTypes.product,
                                  styleKeywords: e.target.value.split(',').map(k => k.trim())
                                }
                              }
                            })}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Comma-separated keywords to define the style of product images
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Blog Images */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Blog Images</h3>
                        <Switch
                          checked={settings.imageTypes.blog.enabled}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            imageTypes: {
                              ...settings.imageTypes,
                              blog: { ...settings.imageTypes.blog, enabled: checked }
                            }
                          })}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="settings-blog-source">Preferred Source</Label>
                          <Select
                            value={settings.imageTypes.blog.preferredSource}
                            onValueChange={(value) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                blog: { ...settings.imageTypes.blog, preferredSource: value }
                              }
                            })}
                          >
                            <SelectTrigger id="settings-blog-source">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stock">Stock Photo API</SelectItem>
                              <SelectItem value="ai_generated">AI Generation</SelectItem>
                              <SelectItem value="hybrid">Hybrid (Try AI, fallback to Stock)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-blog-max">Max Images Per Post</Label>
                          <Input
                            id="settings-blog-max"
                            type="number"
                            value={settings.imageTypes.blog.maxImagesPerPost}
                            onChange={(e) => setSettings({
                              ...settings,
                              imageTypes: {
                                ...settings.imageTypes,
                                blog: {
                                  ...settings.imageTypes.blog,
                                  maxImagesPerPost: parseInt(e.target.value)
                                }
                              }
                            })}
                          />
                        </div>
                        
                        {/* Similar fields for dimensions and style keywords as above */}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Category Images */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Category Images</h3>
                        <Switch
                          checked={settings.imageTypes.category.enabled}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            imageTypes: {
                              ...settings.imageTypes,
                              category: { ...settings.imageTypes.category, enabled: checked }
                            }
                          })}
                        />
                      </div>
                      
                      {/* Similar fields as above */}
                    </div>
                    
                    <Separator />
                    
                    {/* Social Media Images */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Social Media Images</h3>
                        <Switch
                          checked={settings.imageTypes.social.enabled}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            imageTypes: {
                              ...settings.imageTypes,
                              social: { ...settings.imageTypes.social, enabled: checked }
                            }
                          })}
                        />
                      </div>
                      
                      {/* Similar fields as above */}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Stock API Settings */}
                <TabsContent value="stock-api">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="settings-stock-provider">Stock Image Provider</Label>
                      <Select
                        value={settings.stockImageAPI.provider}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          stockImageAPI: { ...settings.stockImageAPI, provider: value }
                        })}
                      >
                        <SelectTrigger id="settings-stock-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unsplash">Unsplash</SelectItem>
                          <SelectItem value="pexels">Pexels</SelectItem>
                          <SelectItem value="pixabay">Pixabay</SelectItem>
                          <SelectItem value="shutterstock">Shutterstock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-stock-api-key">API Key</Label>
                      <Input
                        id="settings-stock-api-key"
                        type="password"
                        placeholder="Enter API key"
                        value="••••••••••••••••"
                        onChange={() => {}} // In a real implementation, this would update the API key
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Search Parameters</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="settings-stock-query">Default Query</Label>
                          <Input
                            id="settings-stock-query"
                            value={settings.stockImageAPI.searchParams.defaultQuery}
                            onChange={(e) => setSettings({
                              ...settings,
                              stockImageAPI: {
                                ...settings.stockImageAPI,
                                searchParams: {
                                  ...settings.stockImageAPI.searchParams,
                                  defaultQuery: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-stock-orientation">Orientation</Label>
                          <Select
                            value={settings.stockImageAPI.searchParams.orientation}
                            onValueChange={(value) => setSettings({
                              ...settings,
                              stockImageAPI: {
                                ...settings.stockImageAPI,
                                searchParams: {
                                  ...settings.stockImageAPI.searchParams,
                                  orientation: value
                                }
                              }
                            })}
                          >
                            <SelectTrigger id="settings-stock-orientation">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="landscape">Landscape</SelectItem>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-stock-color">Color</Label>
                          <Input
                            id="settings-stock-color"
                            placeholder="e.g., blue, red, etc."
                            value={settings.stockImageAPI.searchParams.color}
                            onChange={(e) => setSettings({
                              ...settings,
                              stockImageAPI: {
                                ...settings.stockImageAPI,
                                searchParams: {
                                  ...settings.stockImageAPI.searchParams,
                                  color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="settings-stock-max">Max Results</Label>
                          <Input
                            id="settings-stock-max"
                            type="number"
                            value={settings.stockImageAPI.searchParams.maxResults}
                            onChange={(e) => setSettings({
                              ...settings,
                              stockImageAPI: {
                                ...settings.stockImageAPI,
                                searchParams: {
                                  ...settings.stockImageAPI.searchParams,
                                  maxResults: parseInt(e.target.value)
                                }
                              }
                            })}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="settings-stock-safe"
                            checked={settings.stockImageAPI.searchParams.safeSearch}
                            onCheckedChange={(checked) => setSettings({
                              ...settings,
                              stockImageAPI: {
                                ...settings.stockImageAPI,
                                searchParams: {
                                  ...settings.stockImageAPI.searchParams,
                                  safeSearch: checked
                                }
                              }
                            })}
                          />
                          <Label htmlFor="settings-stock-safe">Enable Safe Search</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* AI Generation Settings */}
                <TabsContent value="ai-generation">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="settings-ai-provider">AI Provider</Label>
                      <Select
                        value={settings.aiGenerationAPI.provider}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          aiGenerationAPI: { ...settings.aiGenerationAPI, provider: value }
                        })}
                      >
                        <SelectTrigger id="settings-ai-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI (DALL-E)</SelectItem>
                          <SelectItem value="stability">Stability AI</SelectItem>
                          <SelectItem value="midjourney">Midjourney</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-ai-model">Model</Label>
                      <Select
                        value={settings.aiGenerationAPI.model}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          aiGenerationAPI: { ...settings.aiGenerationAPI, model: value }
                        })}
                      >
                        <SelectTrigger id="settings-ai-model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                          <SelectItem value="dall-e-2">DALL-E 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-ai-api-key">API Key</Label>
                      <Input
                        id="settings-ai-api-key"
                        type="password"
                        placeholder="Enter API key"
                        value="••••••••••••••••"
                        onChange={() => {}} // In a real implementation, this would update the API key
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-ai-prompt">Default Prompt Template</Label>
                      <Textarea
                        id="settings-ai-prompt"
                        value={settings.aiGenerationAPI.defaultPromptTemplate}
                        onChange={(e) => setSettings({
                          ...settings,
                          aiGenerationAPI: {
                            ...settings.aiGenerationAPI,
                            defaultPromptTemplate: e.target.value
                          }
                        })}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {'{subject}'} as a placeholder for the entity name
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-ai-style">Style Preset</Label>
                      <Input
                        id="settings-ai-style"
                        value={settings.aiGenerationAPI.stylePreset}
                        onChange={(e) => setSettings({
                          ...settings,
                          aiGenerationAPI: {
                            ...settings.aiGenerationAPI,
                            stylePreset: e.target.value
                          }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-ai-negative">Negative Prompt</Label>
                      <Input
                        id="settings-ai-negative"
                        value={settings.aiGenerationAPI.negativePrompt}
                        onChange={(e) => setSettings({
                          ...settings,
                          aiGenerationAPI: {
                            ...settings.aiGenerationAPI,
                            negativePrompt: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Elements to exclude from generated images
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Optimization Settings */}
                <TabsContent value="optimization">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="settings-optimization-enabled" className="text-base">Enable Image Optimization</Label>
                        <p className="text-sm text-gray-500">
                          Automatically optimize images for web
                        </p>
                      </div>
                      <Switch
                        id="settings-optimization-enabled"
                        checked={settings.optimization.enabled}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          optimization: { ...settings.optimization, enabled: checked }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-compression">Compression Level</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          id="settings-compression"
                          min={1}
                          max={100}
                          step={1}
                          value={[settings.optimization.compressionLevel]}
                          onValueChange={(value) => setSettings({
                            ...settings,
                            optimization: { ...settings.optimization, compressionLevel: value[0] }
                          })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center">{settings.optimization.compressionLevel}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Higher values mean smaller file size but lower quality
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-format">Preferred Format</Label>
                      <Select
                        value={settings.optimization.preferredFormat}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          optimization: { ...settings.optimization, preferredFormat: value }
                        })}
                      >
                        <SelectTrigger id="settings-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jpeg">JPEG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                          <SelectItem value="avif">AVIF</SelectItem>
                          <SelectItem value="original">Keep Original</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="settings-webp"
                        checked={settings.optimization.convertToWebP}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          optimization: { ...settings.optimization, convertToWebP: checked }
                        })}
                      />
                      <Label htmlFor="settings-webp">Convert all images to WebP format</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="settings-responsive"
                        checked={settings.optimization.generateResponsiveSizes}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          optimization: { ...settings.optimization, generateResponsiveSizes: checked }
                        })}
                      />
                      <Label htmlFor="settings-responsive">Generate responsive image sizes</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="settings-exif"
                        checked={settings.optimization.stripExif}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          optimization: { ...settings.optimization, stripExif: checked }
                        })}
                      />
                      <Label htmlFor="settings-exif">Strip EXIF metadata</Label>
                    </div>
                  </div>
                </TabsContent>
                
                {/* SEO Settings */}
                <TabsContent value="seo">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="settings-alt-text-enabled" className="text-base">Generate Alt Text</Label>
                        <p className="text-sm text-gray-500">
                          Automatically generate SEO-friendly alt text for images
                        </p>
                      </div>
                      <Switch
                        id="settings-alt-text-enabled"
                        checked={settings.seo.generateAltText}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          seo: { ...settings.seo, generateAltText: checked }
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-alt-text-template">Alt Text Template</Label>
                      <Input
                        id="settings-alt-text-template"
                        value={settings.seo.altTextTemplate}
                        onChange={(e) => setSettings({
                          ...settings,
                          seo: { ...settings.seo, altTextTemplate: e.target.value }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available variables: {'{product_name}'}, {'{category_name}'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="settings-keywords-filename"
                        checked={settings.seo.includeKeywordsInFilename}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          seo: { ...settings.seo, includeKeywordsInFilename: checked }
                        })}
                      />
                      <Label htmlFor="settings-keywords-filename">Include keywords in filename</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-filename-template">Filename Template</Label>
                      <Input
                        id="settings-filename-template"
                        value={settings.seo.filenameTemplate}
                        onChange={(e) => setSettings({
                          ...settings,
                          seo: { ...settings.seo, filenameTemplate: e.target.value }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available variables: {'{entity_type}'}, {'{entity_name}'}, {'{timestamp}'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Style Guidelines */}
                <TabsContent value="style">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="settings-preferred-style">Preferred Style</Label>
                      <Input
                        id="settings-preferred-style"
                        value={settings.styleGuidelines.preferredStyle}
                        onChange={(e) => setSettings({
                          ...settings,
                          styleGuidelines: {
                            ...settings.styleGuidelines,
                            preferredStyle: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated style descriptors
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-avoid-style">Styles to Avoid</Label>
                      <Input
                        id="settings-avoid-style"
                        value={settings.styleGuidelines.avoidStyles}
                        onChange={(e) => setSettings({
                          ...settings,
                          styleGuidelines: {
                            ...settings.styleGuidelines,
                            avoidStyles: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Comma-separated style descriptors to avoid
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="settings-background">Background Preference</Label>
                      <Select
                        value={settings.styleGuidelines.backgroundPreference}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          styleGuidelines: {
                            ...settings.styleGuidelines,
                            backgroundPreference: value
                          }
                        })}
                      >
                        <SelectTrigger id="settings-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="transparent">Transparent</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="contextual">Contextual</SelectItem>
                          <SelectItem value="none">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Color Palette</Label>
                      <div className="space-y-2">
                        {settings.styleGuidelines.colorPalette.map((color, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color.hexCode }}
                            ></div>
                            <Input
                              value={color.name}
                              onChange={(e) => {
                                const newPalette = [...settings.styleGuidelines.colorPalette];
                                newPalette[index].name = e.target.value;
                                setSettings({
                                  ...settings,
                                  styleGuidelines: {
                                    ...settings.styleGuidelines,
                                    colorPalette: newPalette
                                  }
                                });
                              }}
                              className="flex-1"
                            />
                            <Input
                              value={color.hexCode}
                              onChange={(e) => {
                                const newPalette = [...settings.styleGuidelines.colorPalette];
                                newPalette[index].hexCode = e.target.value;
                                setSettings({
                                  ...settings,
                                  styleGuidelines: {
                                    ...settings.styleGuidelines,
                                    colorPalette: newPalette
                                  }
                                });
                              }}
                              className="w-28"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newPalette = settings.styleGuidelines.colorPalette.filter((_, i) => i !== index);
                                setSettings({
                                  ...settings,
                                  styleGuidelines: {
                                    ...settings.styleGuidelines,
                                    colorPalette: newPalette
                                  }
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newPalette = [...settings.styleGuidelines.colorPalette, { name: 'New Color', hexCode: '#cccccc' }];
                            setSettings({
                              ...settings,
                              styleGuidelines: {
                                ...settings.styleGuidelines,
                                colorPalette: newPalette
                              }
                            });
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Color
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button onClick={saveSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
