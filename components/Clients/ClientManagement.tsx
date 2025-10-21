"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Users,
  FileText,
  DollarSign,
  PlusIcon,
  FilterIcon,
} from "lucide-react";
import ClientCard from "@/components/Clients/ClientCard";
import { ClientType } from "@/types";
import CustomButton from "../ui/CustomButton";
import { useRouter } from "next/navigation";

export default function ClientManagement({
  clients,
  business_id,
}: {
  clients: ClientType[];
  business_id: number;
}) {
  const router = useRouter();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-header-text dark:text-slate-100">
              Client Management
            </h1>
            <p className="text-sm md:text-base text-secondary-text dark:text-slate-400 mt-1">
              Manage your clients and their information.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text dark:text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search clients..."
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border-blue-200 focus:ring-primary w-full sm:w-64"
            />
          </div>
          <CustomButton
            label={"Filter"}
            icon={FilterIcon}
            variant={"secondary"}
          />
        </div>
        <CustomButton
          label="Add Client"
          icon={PlusIcon}
          variant="primary"
          onClick={() =>
            router.push(`/dashboard/clients/new?business_id=${business_id}`)
          }
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <ClientCard client={client} key={client.id} />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-header-text dark:text-slate-100">
              {clients.length}
            </p>
            <p className="text-sm text-secondary-text dark:text-slate-400">
              Total Clients
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            {/* <p className="text-2xl font-bold text-header-text dark:text-slate-100">
                    {clients.filter((c) => c.status === "active").length}
                </p> */}
            <p className="text-sm text-secondary-text dark:text-slate-400">
              Active Clients
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            {/* <p className="text-2xl font-bold text-header-text dark:text-slate-100">
                    {clients.reduce((sum, client) => sum + client.invoices, 0)}
                </p> */}
            <p className="text-sm text-secondary-text dark:text-slate-400">
              Total Invoices
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-header-text dark:text-slate-100">
              0
            </p>{" "}
            {/* Replace with actual revenue calculation */}
            <p className="text-sm text-secondary-text dark:text-slate-400">
              Total Revenue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
