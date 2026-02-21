"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityList } from '@/components/ActivityList';
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner"
import { Checkbox, CheckboxIndicator } from '@/components/animate-ui/primitives/radix/checkbox';

type ActivityItem = {
  id: string;
  title: string;
  isCompleted: boolean;
  isRecurring: boolean;
};

export default function ActionsPage({ user }: { user: { name?: string | null } }) {
  const { theme } = useTheme()
  const src = theme === "dark" ? ("/banner_dark.png") : ("/banner_light.png");
  const src_md = theme === "dark" ? ("/banner_dark_md.png") : ("/banner_light_md.png");

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

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
          isRecurring: isRecurring,
          isCompleted: false,
        }),
      });

      if (response.ok) {
        const newActivity = await response.json();
        setActivities([newActivity, ...activities]);
        toast.success("Action added successfully!");
        setNewActivityTitle("");
        setIsRecurring(false);
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
    <div className="min-h-screen">
      <div className="flex w-full max-w-5xl mx-auto flex-col gap-2 md:p-8 ">

        <div className="flex w-full max-w-5xl mx-auto flex-col gap-2">

          <Image
            src={src}
            alt="Owl Banner"
            width={1000}
            height={250}
            className="w-full block md:hidden"
          />
          <Image
            src={src_md}
            alt="Owl Banner"
            width={1000}
            height={200}
            className="w-full rounded-t-2xl hidden md:block h-[36svh]"
          />
        </div>

        <Card className="bg-card-overlay border-0 m-4 md:m-0 md:-mt-2 md:rounded-t-none">
          <CardContent className="pt-2">
            <div className="flex gap-2 flex-col">

              <div className="flex justify-center flex-col items-center">
                <p className="text-sm text-text mt-2">
                  {activities.filter(t => !t.isCompleted).length} Pending, {activities.filter(t => t.isCompleted).length} Completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add an action"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addActivity()}
                  className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 text-text"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                    className="h-5 w-5 shrink-0 rounded border border-text/20 flex items-center justify-center data-[state=checked]:bg-action"
                  >
                    <CheckboxIndicator className="stroke-text h-4 w-4" />
                  </Checkbox>
                  <span className="text-text">Recurring</span>
                </div>
              </div>
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