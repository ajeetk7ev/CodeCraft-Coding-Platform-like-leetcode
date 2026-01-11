import ProblemManagement from "@/components/admin/ProblemManagement";
import { motion } from "framer-motion";

export default function ProblemsList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-10"
    >
      <ProblemManagement />
    </motion.div>
  );
}
