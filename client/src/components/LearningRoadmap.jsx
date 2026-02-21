import { motion } from "framer-motion";
import { Calendar, BookOpen, Zap } from "lucide-react";

const icons = {
  "30 Days": Calendar,
  "60 Days": BookOpen,
  "90 Days": Zap,
};

export default function LearningRoadmap({ steps = [] }) {
  const fallback = [
    { day: "30 Days", title: "Sharpen Core Skills", color: "bg-orange-400", icon: Calendar },
    { day: "60 Days", title: "Build Portfolio Projects", color: "bg-orange-500", icon: BookOpen },
    { day: "90 Days", title: "Interview Readiness", color: "bg-blue-500", icon: Zap },
  ];

  const timeline = steps.length > 0 ? steps : fallback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-3 gap-2.5"
    >
      {timeline.map((step, idx) => {
        const IconComponent = icons[step.day] || Calendar;
        return (
          <motion.div
            key={step.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.1 }}
            whileHover={{ scale: 1.04, y: -2 }}
            className={`${step.color} p-3.5 rounded-2xl text-white shadow-md cursor-pointer transition-all group`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-xs font-bold opacity-90 uppercase tracking-wide">{step.day}</div>
              <IconComponent className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs font-bold leading-tight group-hover:text-white/95">{step.title}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}