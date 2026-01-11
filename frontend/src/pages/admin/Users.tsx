import UserManagement from "@/components/admin/UserManagement";
import { motion } from "framer-motion";

export default function Users() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-10"
    >
      <UserManagement />
    </motion.div>
  );
}
