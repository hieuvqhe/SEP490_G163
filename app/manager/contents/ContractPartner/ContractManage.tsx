import { motion } from 'framer-motion';

const ContractManage = () => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <div>
          <h2 className="text-2xl font-semibold text-white">Quản lý hợp đồng</h2>
          <p className="mt-2 text-sm text-gray-400">
            Trang mẫu hiển thị danh sách hợp đồng, trạng thái và các hành động liên quan.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-white">Danh sách hợp đồng</h3>
        <div className="mt-4 space-y-3 text-sm text-gray-300">
          <p>Hợp đồng A • Đối tác: Alpha Media • Trạng thái: pending_signature</p>
          <p>Hợp đồng B • Đối tác: Beta Entertainment • Trạng thái: active</p>
          <p>Hợp đồng C • Đối tác: Gamma Solutions • Trạng thái: draft</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ContractManage;
