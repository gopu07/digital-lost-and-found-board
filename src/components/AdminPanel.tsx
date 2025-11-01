import { Item } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { CheckCircle, Clock, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface AdminPanelProps {
  items: Item[];
  onUpdateStatus: (id: string, status: Item['status']) => void;
  onDeleteItem: (id: string) => void;
  onViewDetails: (item: Item) => void;
}

export function AdminPanel({ items, onUpdateStatus, onDeleteItem, onViewDetails }: AdminPanelProps) {
  const handleApprove = (id: string) => {
    onUpdateStatus(id, 'active');
    toast.success('Item approved and activated');
  };

  const handleMarkClaimed = (id: string) => {
    onUpdateStatus(id, 'claimed');
    toast.success('Item marked as claimed');
  };

  const handleDelete = (id: string) => {
    onDeleteItem(id);
    toast.success('Item deleted successfully');
  };

  const pendingItems = items.filter(item => item.status === 'pending');
  const activeItems = items.filter(item => item.status === 'active');
  const claimedItems = items.filter(item => item.status === 'claimed');

  return (
    <div className="space-y-6">
      <div>
        <h2>Admin Panel</h2>
        <p className="text-muted-foreground">Manage and moderate reported items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Pending</p>
              <p>{pendingItems.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Active</p>
              <p>{activeItems.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Claimed</p>
              <p>{claimedItems.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
      </div>

      {pendingItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="mb-4">Pending Approvals</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewDetails(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the item.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="mb-4">All Items</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === 'lost' ? 'destructive' : 'default'}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'claimed' ? 'secondary' :
                        item.status === 'pending' ? 'outline' :
                        'default'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetails(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {item.status === 'active' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMarkClaimed(item.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Claimed
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
