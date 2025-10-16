import { BusinessStatistics } from '@/types'
import React from 'react'
import { Card } from '../ui/card'
import { Calendar, DollarSign, FileText, TrendingUp, Users } from 'lucide-react'

export default function BusinessStats({statistic} : BusinessStatistics) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
            <Card>
                <div className="flex items-center justify-between ">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                        {statistic.total_invoices}
                    </span>
                </div>
                <div className='space-y-1'>
                    <h3 className="font-semibold text-header-text dark:text-slate-100">Total Invoices</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                            {statistic.total_paid_invoices} paid
                        </span>
                        <span className="text-sm text-secondary-text dark:text-slate-400">
                            • {statistic.total_pending_invoices} pending
                        </span>
                    </div>
                </div>                
            </Card>
            <Card>
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                        {statistic.total_paid_amount}
                    </span>
                </div>
                <div className='space-y-1'>
                    <h3 className="font-semibold text-header-text dark:text-slate-100">Total Revenue</h3>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                            {statistic.total_paid_amount} this month
                        </span>
                    </div>
                </div>  
            </Card>
            <Card>
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                        {statistic.total_clients}
                    </span>
                </div>
                <div className='space-y-1'>
                    <h3 className="font-semibold text-header-text dark:text-slate-100">Total Clients</h3>
                    {/* <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-medium">
                            {statistic.total_clients} active
                        </span>
                    </div> */}
                </div> 
            </Card>
            <Card>
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="text-2xl font-bold text-header-text dark:text-slate-100">
                        {statistic.total_overdue_invoices}
                    </span>
                </div>
                <div className='space-y-1'>
                    <h3 className="font-semibold text-header-text dark:text-slate-100">Overdue Invoices</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600 font-medium">
                            {statistic.total_overdue_invoices > 0 ? "Needs attention" : "All good!"}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
