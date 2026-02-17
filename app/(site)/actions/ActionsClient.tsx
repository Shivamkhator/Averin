"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityList } from '@/components/ActivityList';
import { Input } from "@/components/ui/input";
import { Plus, Repeat } from "lucide-react";
import { toast } from "sonner"

type ActivityItem = {
  id: string;
  title: string;
  isCompleted: boolean;
  isRecurring: boolean;
};

export default function ActionsPage({ user }: { user: { name?: string | null } }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false); // Add this

  // Add this useEffect
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await fetch("/api/actions");
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async () => {
    if (!newActivityTitle.trim()) return;

    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newActivityTitle,
          isRecurring: false,
          isCompleted: false,
        }),
      });

      if (response.ok) {
        const newActivity = await response.json();
        setActivities([newActivity, ...activities]);
        toast.success("Action added successfully!");
        setNewActivityTitle("");
      }
    } catch (error) {
      console.error("Error adding action:", error);
      toast.error("Failed to add action.");
    }
  };

  const toggleActivity = async (id: string) => {
    const activity = activities.find(t => t.id === id);
    if (!activity) return;

    try {
      const response = await fetch(`/api/actions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !activity.isCompleted }),
      });

      if (response.ok) {
        setActivities(activities.map(t =>
          t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
        ));
      }
    } catch (error) {
      console.error("Error toggling action:", error);
      toast.error("Failed to toggle action.");
    }
  };

  const toggleRecurring = async (id: string) => {
    const activity = activities.find(t => t.id === id);
    if (!activity) return;

    try {
      const response = await fetch(`/api/actions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRecurring: !activity.isRecurring }),
      });

      if (response.ok) {
        setActivities(activities.map(t =>
          t.id === id ? { ...t, isRecurring: !t.isRecurring } : t
        ));
      }
    } catch (error) {
      console.error("Error toggling recurring:", error);
      toast.error("Failed to toggle recurring.");
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const response = await fetch(`/api/actions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setActivities(activities.filter(t => t.id !== id));
        toast.warning("Action deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast.error("Failed to delete action.");
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <video className="h-24 w-24" autoPlay loop muted>
          <source src="/Loader.webm" type="video/webm" />
        </video>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full max-w-3xl mx-auto flex-col gap-6 p-4 md:p-8">
        <div className="flex justify-center flex-col items-center">
          <h1 className="text-3xl font-bold">Actions</h1>
          <p className="text-sm text-text mt-1">
            {activities.filter(t => !t.isCompleted).length} active, {activities.filter(t => t.isCompleted).length} completed
          </p>
        </div>

        <Card className="bg-card-overlay">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new action..."
                value={newActivityTitle}
                onChange={(e) => setNewActivityTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addActivity()}
                className="flex-1 border-overlay shadow-none focus:ring-0 focus:ring-offset-0"
              />
              <Button
                onClick={addActivity}
                className="bg-action hover:bg-action/90"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <ActivityList
          activities={activities}
          onToggle={toggleActivity}
          onDelete={deleteActivity}
        />

      </div>
    </div>
  );
}