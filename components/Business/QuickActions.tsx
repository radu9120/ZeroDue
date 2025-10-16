import Link from "next/link";
import { Users, TrendingUp } from "lucide-react";
import { Card } from "../ui/card";

interface QuickActionsProps {
  companyId: number;
}

export default function QuickActions({ companyId }: QuickActionsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link href={`/dashboard/clients?business_id=${companyId}`}>
                <Card className="group  hover:shadow-xl transition-all ">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-header-text dark:text-slate-100">Manage Clients</h3>
                        <p className="text-sm text-secondary-text dark:text-slate-400">
                            View and edit client information
                        </p>
                    </div>
                </div>
                </Card>
            </Link>

            <Link href={`/dashboard/analytics?business_id=${companyId}`}>
                <Card className="group  hover:shadow-xl transition-all ">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-header-text dark:text-slate-100">View Analytics</h3>
                            <p className="text-sm text-secondary-text dark:text-slate-400">
                                Track revenue and business insights
                            </p>
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    );
}
