"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Types for payment reminders
interface PaymentReminder {
  id: number;
  invoice_id: number;
  reminder_type: "before_due" | "on_due" | "after_due";
  days_offset: number;
  scheduled_date: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
}

interface PaymentRemindersProps {
  invoiceId: number;
  dueDate: string;
  onRemindersChange?: () => void;
}

const reminderTypes = [
  {
    value: "before_due",
    label: "Before due date",
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    value: "on_due",
    label: "On due date",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    value: "after_due",
    label: "After due date",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
];

const presetReminders = [
  { type: "before_due", days: 7, label: "7 days before" },
  { type: "before_due", days: 3, label: "3 days before" },
  { type: "before_due", days: 1, label: "1 day before" },
  { type: "on_due", days: 0, label: "On due date" },
  { type: "after_due", days: 1, label: "1 day after" },
  { type: "after_due", days: 7, label: "7 days after" },
  { type: "after_due", days: 14, label: "14 days after" },
];

export default function PaymentReminders({
  invoiceId,
  dueDate,
  onRemindersChange,
}: PaymentRemindersProps) {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingReminder, setAddingReminder] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: "before_due",
    days: 3,
  });

  // Calculate scheduled date based on due date and reminder settings
  const calculateScheduledDate = (type: string, days: number) => {
    const due = new Date(dueDate);
    let scheduled = new Date(due);

    if (type === "before_due") {
      scheduled.setDate(due.getDate() - days);
    } else if (type === "after_due") {
      scheduled.setDate(due.getDate() + days);
    }

    return scheduled;
  };

  // Mock fetch - in real app, this would call the server action
  useEffect(() => {
    const fetchReminders = async () => {
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReminders([]);
      setLoading(false);
    };
    fetchReminders();
  }, [invoiceId]);

  const addReminder = async () => {
    setAddingReminder(true);
    try {
      // In real app, this would call createPaymentReminder server action
      const scheduledDate = calculateScheduledDate(
        newReminder.type,
        newReminder.days
      );

      const newReminderData: PaymentReminder = {
        id: Date.now(), // Temp ID
        invoice_id: invoiceId,
        reminder_type: newReminder.type as
          | "before_due"
          | "on_due"
          | "after_due",
        days_offset: newReminder.days,
        scheduled_date: scheduledDate.toISOString(),
        is_sent: false,
        sent_at: null,
        created_at: new Date().toISOString(),
      };

      setReminders([...reminders, newReminderData]);
      toast.success("Reminder scheduled");
      setShowAddForm(false);
      setNewReminder({ type: "before_due", days: 3 });
      onRemindersChange?.();
    } catch (error) {
      toast.error("Failed to add reminder");
    } finally {
      setAddingReminder(false);
    }
  };

  const removeReminder = async (reminderId: number) => {
    try {
      setReminders(reminders.filter((r) => r.id !== reminderId));
      toast.success("Reminder removed");
      onRemindersChange?.();
    } catch (error) {
      toast.error("Failed to remove reminder");
    }
  };

  const addPresetReminder = async (preset: (typeof presetReminders)[0]) => {
    // Check if this preset already exists
    const exists = reminders.some(
      (r) => r.reminder_type === preset.type && r.days_offset === preset.days
    );

    if (exists) {
      toast.error("This reminder is already scheduled");
      return;
    }

    setNewReminder({ type: preset.type, days: preset.days });
    await addReminder();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  const dueDateObj = new Date(dueDate);
  const isPastDue = dueDateObj < new Date();

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-900 dark:text-slate-100">
            Payment Reminders
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Due:{" "}
            {dueDateObj.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>
          {!showAddForm && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddForm(true)}
              className="h-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Add Presets */}
      {showAddForm && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Quick add:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {presetReminders.map((preset, index) => {
              const exists = reminders.some(
                (r) =>
                  r.reminder_type === preset.type &&
                  r.days_offset === preset.days
              );
              const typeInfo = reminderTypes.find(
                (t) => t.value === preset.type
              );
              return (
                <button
                  key={index}
                  onClick={() => !exists && addPresetReminder(preset)}
                  disabled={exists}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    exists
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                      : `${typeInfo?.bgColor} ${typeInfo?.color} hover:opacity-80`
                  }`}
                >
                  {exists && <Check className="h-3 w-3 inline mr-1" />}
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Reminder Form */}
          <div className="flex items-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">When</label>
              <Select
                value={newReminder.type}
                onValueChange={(value) =>
                  setNewReminder({ ...newReminder, type: value })
                }
              >
                <SelectTrigger className="h-9 text-sm dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-20">
              <label className="text-xs text-slate-500 mb-1 block">Days</label>
              <Input
                type="number"
                min="0"
                max="90"
                value={newReminder.days}
                onChange={(e) =>
                  setNewReminder({
                    ...newReminder,
                    days: parseInt(e.target.value) || 0,
                  })
                }
                className="h-9 text-sm dark:bg-slate-800 dark:border-slate-700"
                disabled={newReminder.type === "on_due"}
              />
            </div>
            <Button
              size="sm"
              onClick={addReminder}
              disabled={addingReminder}
              className="h-9 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            >
              {addingReminder ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAddForm(false)}
              className="h-9"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="p-6 text-center">
          <BellRing className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No reminders scheduled
          </p>
          {!showAddForm && (
            <Button
              size="sm"
              variant="link"
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              Add reminder
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {reminders
            .sort(
              (a, b) =>
                new Date(a.scheduled_date).getTime() -
                new Date(b.scheduled_date).getTime()
            )
            .map((reminder) => {
              const scheduledDate = new Date(reminder.scheduled_date);
              const isUpcoming = scheduledDate > new Date();
              const typeInfo = reminderTypes.find(
                (t) => t.value === reminder.reminder_type
              );

              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeInfo?.bgColor}`}
                    >
                      {reminder.is_sent ? (
                        <Check className={`h-5 w-5 ${typeInfo?.color}`} />
                      ) : (
                        <Clock className={`h-5 w-5 ${typeInfo?.color}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {reminder.days_offset === 0
                          ? "On due date"
                          : `${reminder.days_offset} day${reminder.days_offset !== 1 ? "s" : ""} ${
                              reminder.reminder_type === "before_due"
                                ? "before"
                                : "after"
                            }`}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {scheduledDate.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminder.is_sent ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Sent
                      </span>
                    ) : isUpcoming ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Missed
                      </span>
                    )}
                    <button
                      onClick={() => removeReminder(reminder.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
