import { useState } from 'react';
import { Item } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { categories, locations } from '../utils/mockData';
import { Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';

interface ReportItemFormProps {
  onSubmit: (item: Omit<Item, 'id' | 'createdAt'>) => void;
}

export function ReportItemForm({ onSubmit }: ReportItemFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    location: 'Library - 2nd Floor',
    date: new Date().toISOString().split('T')[0],
    type: 'found' as 'lost' | 'found',
    status: 'active' as const,
    contactName: '',
    contactInfo: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
        setErrors({ ...errors, image: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Contact info is required';
    } else if (!formData.contactInfo.includes('@') && !formData.contactInfo.match(/^\d{10}$/)) {
      newErrors.contactInfo = 'Please provide a valid email or 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    onSubmit(formData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'Electronics',
      location: 'Library - 2nd Floor',
      date: new Date().toISOString().split('T')[0],
      type: 'found',
      status: 'active',
      contactName: '',
      contactInfo: '',
      image: '',
    });
    setImagePreview('');
    setErrors({});
    
    // Note: Success toast is handled by parent component (App.tsx)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2>Report an Item</h2>
            <p className="text-muted-foreground">Fill in the details to report a lost or found item</p>
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: 'lost' | 'found') =>
                setFormData({ ...formData, type: value })
              }
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost Item</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found">Found Item</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Item Name *</Label>
            <Input
              id="title"
              placeholder="e.g., Blue Backpack"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed description of the item..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'All').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.filter(loc => loc !== 'All').map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Your Name *</Label>
            <Input
              id="contactName"
              placeholder="John Doe"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className={errors.contactName ? 'border-red-500' : ''}
            />
            {errors.contactName && (
              <p className="text-red-500">{errors.contactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Info (Email/Phone) *</Label>
            <Input
              id="contactInfo"
              placeholder="your.email@campus.edu or 1234567890"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              className={errors.contactInfo ? 'border-red-500' : ''}
            />
            {errors.contactInfo && (
              <p className="text-red-500">{errors.contactInfo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Item Image (Optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview('');
                    setFormData({ ...formData, image: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Click to upload image (Max 5MB)
                  </p>
                </label>
              </div>
            )}
            {errors.image && (
              <p className="text-red-500">{errors.image}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Report Item
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
