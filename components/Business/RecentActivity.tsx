import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { UserActivityLog } from "@/types";
import {
  Building,
  FileText,
  Mail,
  MailOpen,
  MousePointerClick,
  AlertCircle,
  XCircle,
} from "lucide-react";
import timestamptzConvert from "../ui/timestamptzConvert";

export default function RecentActivity({
  recentActivities,
}: {
  recentActivities: UserActivityLog[];
}) {
  const getActivityIcon = (activity: UserActivityLog) => {
    // Email-related activities
    if (activity.action === "Sent invoice") {
      return (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email delivered") {
      return (
        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
          <MailOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email opened") {
      return (
        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
          <MailOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email clicked") {
      return (
        <div className="w-8 h-8 bg-violet-100 dark:bg-violet-800 rounded-full flex items-center justify-center">
          <MousePointerClick className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email bounced") {
      return (
        <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
      );
    }
    if (activity.action === "Invoice email marked as spam") {
      return (
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center">
          <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      );
    }

    // Default icons for other activities
    if (activity.target_type === "business") {
      return (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
          <Building className="h-4 w-4 text-primary dark:text-blue-400" />
        </div>
      );
    }
    if (activity.target_type === "invoice") {
      return (
        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
        <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </div>
    );
  };

  const getActivityBackground = (activity: UserActivityLog) => {
    // Email-related activities
    if (activity.action === "Sent invoice")
      return "bg-blue-50 dark:bg-blue-900/20";
    if (activity.action === "Invoice email delivered")
      return "bg-green-50 dark:bg-green-900/20";
    if (activity.action === "Invoice email opened")
      return "bg-amber-50 dark:bg-amber-900/20";
    if (activity.action === "Invoice email clicked")
      return "bg-violet-50 dark:bg-violet-900/20";
    if (activity.action === "Invoice email bounced")
      return "bg-red-50 dark:bg-red-900/20";
    if (activity.action === "Invoice email marked as spam")
      return "bg-orange-50 dark:bg-orange-900/20";

    // Default backgrounds
    if (activity.target_type === "business")
      return "bg-blue-50 dark:bg-blue-900/20";
    if (activity.target_type === "invoice")
      return "bg-green-50 dark:bg-green-900/20";
    return "bg-purple-50 dark:bg-purple-900/20";
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-header-text dark:text-slate-100 mb-2">
          Recent Activity
        </h2>
        <p className="text-sm text-secondary-text dark:text-slate-400">
          All your recent actions and email tracking
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="overflow-y-auto pr-4 pl-6 pb-6 space-y-3 custom-scrollbar"
          style={{ maxHeight: "600px" }}
        >
          {recentActivities.length > 0 ? (
            <>
              {recentActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md ${getActivityBackground(activity)}`}
                >
                  {getActivityIcon(activity)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-header-text dark:text-slate-100">
                      {activity.action} {activity.target_name}
                    </p>
                    <p className="text-sm text-secondary-text dark:text-slate-400">
                      {activity.created_at &&
                        timestamptzConvert(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 text-secondary-text dark:text-slate-400">
              <p>No recent activity yet</p>
            </div>
          )}
        </div>
        {recentActivities.length > 5 && (
          <div className="text-center py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <p className="text-xs text-secondary-text dark:text-slate-400">
              {recentActivities.length} total activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
