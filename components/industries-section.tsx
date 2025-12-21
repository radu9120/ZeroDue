"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase,
  Hammer,
  Users,
  Sparkles,
  Zap,
  Wrench,
  Camera,
  Palette,
  Trees,
} from "lucide-react";

const industries = [
  {
    name: "Freelancers",
    href: "/industries/freelancers",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-500",
    description: "Perfect for independent professionals",
  },
  {
    name: "Contractors",
    href: "/industries/contractors",
    icon: Hammer,
    color: "from-orange-500 to-red-500",
    description: "Built for construction & trades",
  },
  {
    name: "Consultants",
    href: "/industries/consultants",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    description: "Streamline client billing",
  },
  {
    name: "Cleaning",
    href: "/industries/cleaning",
    icon: Sparkles,
    color: "from-green-500 to-emerald-500",
    description: "Recurring service billing made easy",
  },
  {
    name: "Electricians",
    href: "/industries/electricians",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    description: "Job-based invoicing tools",
  },
  {
    name: "Plumbers",
    href: "/industries/plumbers",
    icon: Wrench,
    color: "from-blue-500 to-indigo-500",
    description: "Emergency & scheduled work",
  },
  {
    name: "Photographers",
    href: "/industries/photographers",
    icon: Camera,
    color: "from-pink-500 to-rose-500",
    description: "Project & package billing",
  },
  {
    name: "Designers",
    href: "/industries/designers",
    icon: Palette,
    color: "from-violet-500 to-purple-500",
    description: "Creative project invoicing",
  },
  {
    name: "Landscaping",
    href: "/industries/landscaping",
    icon: Trees,
    color: "from-green-600 to-teal-500",
    description: "Seasonal & recurring services",
  },
];

export default function IndustriesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Built for Your Industry
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tailored invoicing solutions for every profession. Get features
            designed specifically for your business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={industry.href}
                className="group block p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <industry.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {industry.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {industry.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
