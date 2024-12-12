"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PopoverClose } from "@radix-ui/react-popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "admin" | "customer";
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: Date;
  read: boolean;
}

export default function Component() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "admin",
      user: {
        name: "Samuel Ikechukwu",
        avatar: "",
        initials: "SI",
      },
      action: "requests permission to change",
      target: "Customer Details",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      type: "admin",
      user: {
        name: "David Johnson",
        avatar: "",
        initials: "DJ",
      },
      action: "requests permission to change",
      target: "Team Details",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      type: "customer",
      user: {
        name: "Daniel James",
        avatar: "",
        initials: "DJ",
      },
      action: "approved",
      target: "Individual Customer Registration",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: false,
    },
    {
      id: "4",
      type: "customer",
      user: {
        name: "Mike Oluwatobiloba",
        avatar: "",
        initials: "MO",
      },
      action: "submitted document for",
      target: "KYC",
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      read: false,
    },
    {
      id: "5",
      type: "customer",
      user: {
        name: "Esther Williams",
        avatar: "",
        initials: "EW",
      },
      action: "submitted document for",
      target: "KYC",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState("general");
  const [isOpen, setIsOpen] = useState(false);

  const adminNotifications = notifications.filter((n) => n.type === "admin");
  const customerNotifications = notifications.filter(
    (n) => n.type === "customer"
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadAdminCount = adminNotifications.filter((n) => !n.read).length;
  const unreadCustomerCount = customerNotifications.filter(
    (n) => !n.read
  ).length;

  // useEffect(() => {
  //   if (isOpen) {
  //     const timer = setTimeout(() => {
  //       setNotifications((prevNotifications) =>
  //         prevNotifications.map((notification) => ({
  //           ...notification,
  //           read: true,
  //         }))
  //       );
  //     }, 5000); // Mark all as read after 5 seconds of opening the popover

  //     return () => clearTimeout(timer);
  //   }
  // }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const getNotificationsForTab = () => {
    switch (activeTab) {
      case "admin":
        return adminNotifications;
      case "customer":
        return customerNotifications;
      default:
        return notifications;
    }
  };

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full "
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[380px] p-0 mr-2 mt-5" align="center">
          <div className="title px-3 flex justify-between items-center">
            <div className="font-semibold text-sm py-3">Notifications</div>
            <PopoverClose>
              <X className="size-5 rounded-md p-1 border" />
            </PopoverClose>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between border-b /px-3">
              <TabsList className="grid w-full bg-transparent pb-0 h-full grid-cols-3">
                <TabsTrigger value="general" className="text-xs">
                  General{" "}
                  <span className="ml-1 text-primary p-[10px] bg-primary/10 rounded-full size-3 flex justify-center items-center">
                    {unreadCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="text-xs">
                  Admin{" "}
                  <span className="ml-1 text-primary p-[10px] bg-primary/10 rounded-full size-3 flex justify-center items-center">
                    {unreadAdminCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="customer" className="text-xs">
                  Customer{" "}
                  <span className="ml-1 text-primary p-[10px] bg-primary/10 rounded-full size-3 flex justify-center items-center">
                    {unreadCustomerCount}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={activeTab} className="p-0">
              <NotificationList
                notifications={getNotificationsForTab()}
                markAsRead={markAsRead}
              />
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function NotificationList({
  notifications,
  markAsRead,
}: {
  notifications: Notification[];
  markAsRead: (id: string) => void;
}) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const notificationId = entry.target.id;
            let timer: NodeJS.Timeout;

            const handleIntersection = () => {
              timer = setTimeout(() => {
                markAsRead(notificationId);
              }, 3000);
            };

            handleIntersection();

            return () => {
              if (timer) clearTimeout(timer);
            };
          }
        });
      },
      // The threshold value determines the percentage of the notification element that must be visible within the viewport to trigger the IntersectionObserver callback.
      { threshold: 0.041 }
    );

    notifications.forEach((notification) => {
      const element = notificationRefs.current[notification.id];
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [notifications, markAsRead]);

  return (
    <ScrollArea className="h-auto max-h-[300px] overflow-scroll">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          id={notification.id}
          ref={(el) => {
            if (el) {
              notificationRefs.current[notification.id] = el;
            }
          }}
          className="flex items-start gap-3 border-b p-4 hover:bg-muted/50"
          onClick={() => markAsRead(notification.id)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.user.avatar} />
            <AvatarFallback>{notification.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm">
              <span className="font-medium">{notification.user.name}</span>{" "}
              <span className="text-muted-foreground">
                {notification.action}
              </span>{" "}
              <span className="font-medium">{notification.target}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {notification.type === "admin" ? "Admin" : "Customer"} Activity •{" "}
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </p>
          </div>
          {!notification.read && (
            <div className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
      ))}
    </ScrollArea>
  );
}
