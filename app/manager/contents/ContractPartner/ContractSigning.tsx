import { motion } from 'framer-motion';

import PartnerSigningTab from './PartnerSigningTab';

const ContractSigning = () => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PartnerSigningTab />
    </motion.div>
  );
};

export default ContractSigning;
