import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Trophy, Award, Star, Medal, Search } from 'lucide-react';
import { apiService, BadgeData } from '../services/api';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

const badgeInfo: Record<string, { name: string; icon: typeof Trophy; description: string }> = {
  first_report: {
    name: 'First Reporter',
    icon: Star,
    description: 'Reported your first item',
  },
  reporter_10: {
    name: 'Active Reporter',
    icon: Award,
    description: 'Reported 10 items',
  },
  reporter_50: {
    name: 'Super Reporter',
    icon: Trophy,
    description: 'Reported 50 items',
  },
  first_claim: {
    name: 'First Claim',
    icon: Medal,
    description: 'Successfully claimed your first item',
  },
  claimer_5: {
    name: 'Claim Master',
    icon: Trophy,
    description: 'Claimed 5 items',
  },
  matchmaker: {
    name: 'Matchmaker',
    icon: Star,
    description: 'Found a match using image similarity',
  },
};

export function BadgesPanel() {
  const [email, setEmail] = useState('');
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getUserBadges(email);
      setBadgeData(data);
    } catch (error) {
      toast.error('Failed to fetch badges');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Badges & Achievements</h2>
        <p className="text-muted-foreground">Check your achievements and badges</p>
      </div>

      <Card className="p-6">
        <div className="flex gap-2 mb-6">
          <Input
            type="email"
            placeholder="Enter your email to view badges"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {badgeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-1">Items Reported</p>
                  <p className="text-3xl font-bold">{badgeData.reported_count}</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-1">Items Claimed</p>
                  <p className="text-3xl font-bold">{badgeData.claimed_count}</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-1">Matches Found</p>
                  <p className="text-3xl font-bold">{badgeData.match_count}</p>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Your Badges</h3>
              {badgeData.badges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No badges yet. Start reporting items to earn badges!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badgeData.badges.map((badgeKey) => {
                    const info = badgeInfo[badgeKey];
                    if (!info) return null;

                    const Icon = info.icon;
                    return (
                      <motion.div
                        key={badgeKey}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{info.name}</h4>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}

