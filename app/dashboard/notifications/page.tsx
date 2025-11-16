"use client";

import { Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New project proposal submitted",
      description: "Construction of Barangay Road - Barangay 1 has been submitted for review",
      time: "5 minutes ago",
      unread: true,
      category: "Proposal",
    },
    {
      id: 2,
      title: "Budget allocation approved",
      description: "₱5,000,000 has been allocated for Infrastructure projects",
      time: "1 hour ago",
      unread: true,
      category: "Budget",
    },
    {
      id: 3,
      title: "Milestone completed",
      description: "Foundation Work milestone completed for Project #42",
      time: "2 hours ago",
      unread: false,
      category: "Progress",
    },
    {
      id: 4,
      title: "New bid submission",
      description: "Alpha Construction Corp. submitted a bid for ₱4,800,000",
      time: "3 hours ago",
      unread: false,
      category: "Bidding",
    },
    {
      id: 5,
      title: "Project status changed",
      description: "Water System Improvement moved to In Progress status",
      time: "5 hours ago",
      unread: false,
      category: "Status",
    },
    {
      id: 6,
      title: "Inspection report submitted",
      description: "Technical Inspector submitted report for Project #38",
      time: "1 day ago",
      unread: false,
      category: "Inspection",
    },
  ]);

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => n.unread)
    : notifications;

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Proposal: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
      Budget: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      Progress: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
      Bidding: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
      Status: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
      Inspection: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your project activities
          </p>
        </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length}</p>
              <p className="text-sm text-muted-foreground">Total Notifications</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Bell className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unreadCount}</p>
              <p className="text-sm text-muted-foreground">Unread</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
              <p className="text-sm text-muted-foreground">Read</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-600"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">
                {filter === "unread" 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-5 transition-all hover:shadow-md ${
                notification.unread ? "border-l-4 border-l-blue-600 bg-blue-50/30 dark:bg-blue-950/10" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {notification.unread && (
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold mb-1">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getCategoryColor(notification.category)}`}>
                      {notification.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                    <div className="flex items-center gap-2">
                      {notification.unread && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 text-xs"
                        >
                          <CheckCheck className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
