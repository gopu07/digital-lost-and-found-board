import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { ReportItemForm } from './components/ReportItemForm';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { BadgesPanel } from './components/BadgesPanel';
import { ItemDetailsDialog } from './components/ItemDetailsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { Item } from './types';
import { apiService, ApiItem } from './services/api';
import { Home, PlusCircle, BarChart3, Settings, Trophy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Load items from API
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const apiItems = await apiService.getItems();
      // Convert API items to local Item type (they're compatible)
      setItems(apiItems as Item[]);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items. Using fallback mode.');
      // Fallback to empty array
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark');
  };

  const handleAddItem = async (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    try {
      const result = await apiService.addItem(itemData as any);
      toast.success('Item reported successfully!');
      
      // Show notification if there are similar items
      if (result.hasMatch && result.similarItems.length > 0) {
        toast.info(`Potential match found! ${result.similarItems.length} similar item(s) detected.`, {
          duration: 5000,
        });
      }
      
      // Reload items
      await loadItems();
      setActiveTab('browse');
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast.error(error.message || 'Failed to add item');
    }
  };

  const handleUpdateStatus = async (id: string, status: Item['status']) => {
    try {
      await apiService.updateItem(id, { status });
      toast.success('Item status updated successfully!');
      await loadItems();
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast.error(error.message || 'Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await apiService.deleteItem(id);
      toast.success('Item deleted successfully!');
      await loadItems();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  // Filter items by search query from header
  const searchFilteredItems = searchQuery
    ? items.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower) ||
          item.contactName.toLowerCase().includes(searchLower)
        );
      })
    : items;

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-8">
            <TabsTrigger value="browse">
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="report">
              <PlusCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Report</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Trophy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="admin">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <ItemList
              items={searchQuery ? searchFilteredItems : items}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="report">
            <ReportItemForm onSubmit={handleAddItem} />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard items={items} />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesPanel />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel
              items={items}
              onUpdateStatus={handleUpdateStatus}
              onDeleteItem={handleDeleteItem}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
      </main>

      <ItemDetailsDialog
        item={selectedItem}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onMarkClaimed={handleUpdateStatus}
      />

      <Toaster />
    </div>
  );
}
