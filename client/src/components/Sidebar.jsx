import avatar from "../assets/ai-avatar.png";
import { motion } from "framer-motion";
import { Edit3, Target, MessageSquare } from "lucide-react";

export default function Sidebar({
  futureSkills = [],
  targetRole = "software developer",
  completionPercent = 0,
  user = null,
}) {
  const skills = futureSkills.length > 0 ? futureSkills.slice(0, 3) : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 min-h-0 overflow-y-auto pr-1"
    >
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 text-center flex-shrink-0 shadow-red bg-[#F2D9A0]"
      >
        <div className="relative inline-block mb-3">
          <img
            src={avatar}
            className="w-40 h-40 rounded-full border-4 border-red-600 shadow-md mx-auto object-cover"
            alt="Profile"
          />
          <div className="absolute bottom-0.5 right-0.5 w-7 h-7 bg-green-500 border-2 border-white shadow-md animate-pulse rounded-full" />
        </div>

        <h3 className="text-base font-bold text-slate-800 mt-2">
          {user ? user.email : "Alex Johnson"}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 uppercase font-semibold tracking-wide">Target Role</p>
        <p className="text-xs text-slate-700 font-bold mt-1 capitalize h-4">
          {user ? user.targetJob : targetRole}
        </p>

        {/*  */}
      </motion.div>

      {/* Future Skills Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-4 flex-shrink-0 max-h-[250px] overflow-y-auto"
      >
        <div className="flex items-center gap-1.5 mb-3 sticky top-0 bg-white/50 -m-4 px-4 pt-4 pb-2">
          <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <h3 className="font-bold text-slate-800 text-xs">Future Skills</h3>
        </div>

        {skills.length > 0 ? (
          <div className="space-y-2 mt-3">
            {skills.map((skill, idx) => (
              <motion.div
                key={`${skill}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2 p-2.5 bg-white/50 hover:bg-blue-50 rounded-lg transition-all cursor-pointer group"
              >
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">•</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors capitalize">
                  {skill}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-6 text-center">
            <p className="text-xs text-slate-500 font-medium">Upload your resume to see future skills</p>
          </div>
        )}
      </motion.div>

      {/* Help CTA Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden flex-shrink-0"
      >
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -top-3 -left-3 w-12 h-12 bg-white/10 rounded-full blur-lg" />

        <div className="relative z-10">
          <div className="flex items-start gap-1.5 mb-1.5">
            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-bold opacity-90 uppercase tracking-wide">Need Help?</p>
          </div>
          <p className="text-xs font-semibold mb-3 leading-tight">Talk to a career counselor today.</p>
          <button className="w-full bg-white text-blue-600 px-3 py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
            Book Session
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}