import React from 'react';
import { Users, Radio } from 'lucide-react';
import { User } from '../types';

interface TeamStatusRosterProps {
  users: User[];
}

export const TeamStatusRoster: React.FC<TeamStatusRosterProps> = ({ users }) => {
  const onlineCount = users.filter((u) => u.isOnline).length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#eeeffa] text-[#494c7e]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Status Tim Terdaftar
            </h4>
            <p className="text-[11px] text-slate-400">Monitoring Petugas & Admin (Display Saja)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>{onlineCount} Online</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
            {users.length - onlineCount} Offline
          </span>
        </div>
      </div>

      {/* Roster Grid - non-clickable display only */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 select-none pointer-events-none">
        {users.map((user) => {
          const isOnline = !!user.isOnline;
          return (
            <div
              key={user.id}
              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                isOnline
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50 border-slate-200/60 opacity-70'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={user.avatar || '/logo.png'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover bg-white border border-slate-200"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white ${
                    isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">
                  {isOnline ? 'Online' : user.lastSeen || 'Offline'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
