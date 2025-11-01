import { Item } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Calendar, User, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { apiService, SimilarItem } from '../services/api';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';
import { motion } from 'motion/react';

interface ItemDetailsDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkClaimed: (id: string, status: Item['status']) => void;
}

export function ItemDetailsDialog({
  item,
  open,
  onOpenChange,
  onMarkClaimed,
}: ItemDetailsDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [similarItems, setSimilarItems] = useState<SimilarItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (item && open) {
      const itemUrl = `${window.location.origin}?item=${item.id}`;
      QRCode.toDataURL(itemUrl, { width: 200 })
        .then(setQrCodeUrl)
        .catch(console.error);

      // Fetch similar items
      if (item.id) {
        setLoadingSimilar(true);
        apiService
          .getSimilarItems(item.id)
          .then(setSimilarItems)
          .catch(console.error)
          .finally(() => setLoadingSimilar(false));
      }
    } else {
      setSimilarItems([]);
    }
  }, [item, open]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle>{item.title}</DialogTitle>
              <DialogDescription>
                {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                {item.type === 'lost' ? 'Lost' : 'Found'}
              </Badge>
              <Badge variant={
                item.status === 'claimed' ? 'secondary' : 
                item.status === 'pending' ? 'outline' : 
                'default'
              }>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {item.image && (
            <ImageWithFallback
              src={item.image}
              alt={item.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          <div>
            <h4 className="mb-2">Description</h4>
            <p className="text-muted-foreground">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{item.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{new Date(item.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Contact Name</p>
                  <p>{item.contactName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-muted-foreground">Contact Info</p>
                  <p>{item.contactInfo}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground mb-2">QR Code</p>
              {qrCodeUrl && (
                <ImageWithFallback
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="border rounded-lg p-2"
                />
              )}
              <p className="text-muted-foreground mt-2">Scan to view details</p>
            </div>
          </div>

          {similarItems.length > 0 && (
            <Alert className="border-orange-500 bg-orange-500/10">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertTitle>Potential Match Found!</AlertTitle>
              <AlertDescription>
                We found {similarItems.length} similar item(s) based on image analysis. Check them out below!
              </AlertDescription>
            </Alert>
          )}

          {similarItems.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold">Similar Items</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {similarItems.map((similarItem) => (
                  <motion.div
                    key={similarItem.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                      {similarItem.image && (
                        <ImageWithFallback
                          src={similarItem.image}
                          alt={similarItem.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <h5 className="font-semibold line-clamp-1">{similarItem.title}</h5>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={similarItem.type === 'lost' ? 'destructive' : 'default'}>
                          {similarItem.type}
                        </Badge>
                        <Badge variant="outline">{similarItem.status}</Badge>
                        <Badge variant="secondary">{similarItem.similarity}% match</Badge>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {item.status === 'active' && (
              <Button
                className="flex-1"
                onClick={() => {
                  onMarkClaimed(item.id, 'claimed');
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Claimed
              </Button>
            )}
            {item.status === 'pending' && (
              <Button className="flex-1" variant="secondary">
                <Clock className="w-4 h-4 mr-2" />
                Pending Verification
              </Button>
            )}
            {item.status === 'claimed' && (
              <Button className="flex-1" variant="secondary" disabled>
                <CheckCircle className="w-4 h-4 mr-2" />
                Already Claimed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
