import { Item } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Calendar, User, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
}

export function ItemCard({ item, onViewDetails }: ItemCardProps) {
  const isNew = new Date().getTime() - new Date(item.createdAt).getTime() < 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(item)}>
        <div className="relative">
          {item.image ? (
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">📦</div>
                <p>No image</p>
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            {isNew && (
              <Badge className="bg-green-500">New</Badge>
            )}
            <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </Badge>
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant={
              item.status === 'claimed' ? 'secondary' : 
              item.status === 'pending' ? 'outline' : 
              'default'
            }>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className="line-clamp-1">{item.title}</h3>
            <Badge variant="outline" className="mt-1">
              {item.category}
            </Badge>
          </div>

          <p className="text-muted-foreground line-clamp-2 mb-4">
            {item.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{item.contactName}</span>
            </div>
          </div>

          <Button className="w-full mt-4" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
