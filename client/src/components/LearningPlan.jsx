import { motion } from "framer-motion";

export default function LearningPlan({ data }) {
  // Agar data backend se nahi aaya, toh ye default values dikhayega (jaisa aapki image mein hai)
  const plan = data?.plan || [
    { days: "30 Days", topic: "Machine Learning Basics", color: "bg-[#f39c12]" },
    { days: "60 Days", topic: "Advanced Data Engineering", color: "bg-[#e67e22]" },
    { days: "90 Days", topic: "AI & Deep Learning", color: "bg-[#3498db]" }
  ];

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 px-2">
        <span className="text-blue-600 text-lg">📅</span>
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
          Learning Roadmap
        </h3>
      </div>

      {/* Horizontal Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plan.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`${item.color} p-4 rounded-2xl soft-shadow text-white relative overflow-hidden group cursor-pointer`}
          >
            {/* Day Badge */}
            <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-lg text-[10px] font-black mb-3 uppercase tracking-tighter">
              {item.days}
            </div>

            {/* Topic Name */}
            <div className="font-bold text-sm leading-snug pr-4 min-h-[40px]">
              {item.topic}
            </div>

            {/* Decorative Background Icon (Subtle) */}
            <div className="absolute -bottom-2 -right-2 text-4xl opacity-10 group-hover:opacity-20 transition-opacity">
               📚
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}