"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Trees, Shield, Flame } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import BiomassChart from "@/components/dashboard/BiomassChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function DashboardOverview() {
  const { userId, isLoaded } = useAuth();
  
  const [stats, setStats] = useState({ total_credits: 0, total_area: 0, active_alerts: 0 });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!isLoaded || !userId) return;
    Promise.all([
        fetch(`${API_URL}/stats?userId=${userId}`).then(res => res.json()),
        fetch(`${API_URL}/activity?userId=${userId}`).then(res => res.json())
    ]).then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
        setLoading(false);
    }).catch(err => console.error("Dashboard Load Failed:", err));

  }, [isLoaded, userId]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-end justify-between">
        <div>
            <h1 className="text-3xl font-bold font-heading text-white">Mission Control</h1>
            <p className="text-gray-500 font-mono text-xs mt-1">REAL-TIME ORBITAL DATA</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="Total Area Scanned" 
            value={`${stats.total_area} ha`} 
            icon={<Trees size={24}/>} 
            color="emerald" 
            delay={0.1} 
        />
        <StatCard 
            title="Credits Minted" 
            value={stats.total_credits} 
            icon={<Shield size={24}/>} 
            color="blue" 
            delay={0.2} 
        />
        <StatCard 
            title="Active Alerts" 
            value={stats.active_alerts} 
            icon={<Flame size={24}/>} 
            color="red" 
            delay={0.3} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 h-full">
            <BiomassChart data={activity} />
        </div>
        <div className="h-full">
            <ActivityFeed data={activity} />
        </div>
      </div>
    </div>
  );
}