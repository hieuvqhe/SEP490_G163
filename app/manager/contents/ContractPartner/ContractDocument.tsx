"use client";

import { Document, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';

import type { ContractDetail } from '@/apis/manager.contract.api';

// Đăng ký font Roboto (giữ nguyên như code của bạn)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/roboto-regular.ttf', // Roboto Regular
    },
    {
      src: '/fonts/roboto-bold.ttf', // Roboto Bold
      fontWeight: 'bold',
    },
    {
      src: '/fonts/roboto-italic.ttf', // Roboto Italic
      fontStyle: 'italic',
    },
    {
      src: '/fonts/roboto-bold-italic.ttf', // Roboto Bold Italic
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48, // Tăng padding cho lề giống hợp đồng
    fontSize: 12,
    fontFamily: 'Roboto',
    lineHeight: 1.5, // Giãn dòng 1.5
    color: '#000000', // Màu chữ đen
  },
  // --- STYLES MỚI CHO TIÊU NGỮ VÀ TIÊU ĐỀ ---
  header: {
    textAlign: 'center',
    marginBottom: 24,
  },
  nationalMotto: {
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
  },
  independenceMotto: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  mottoUnderline: {
    width: 170, // Độ rộng tương ứng với "Độc lập - Tự do - Hạnh phúc"
    height: 1,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
  },
  // --- STYLES CŨ (giữ nguyên) ---
  section: {
    marginBottom: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Roboto', // Đảm bảo heading dùng Roboto bold
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flexDirection: 'column',
    width: '48%',
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'Roboto', // Đảm bảo label dùng Roboto bold
  },
  text: {
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginVertical: 12,
  },
  // --- STYLES MỚI CHO CHỮ KÝ ---
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 60, // Khoảng cách lớn trước khi ký
  },
  signatureBlock: {
    width: '45%',
    textAlign: 'center',
  },
  signatureTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  signatureRole: {
    fontStyle: 'italic',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 60, // Tạo khoảng trống để ký tay
  },
  signatureName: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});

interface ContractDocumentProps {
  contract: ContractDetail;
}

const ContractDocument = ({ contract }: ContractDocumentProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* === TIÊU NGỮ === */}
        <View style={styles.header}>
          <Text style={styles.nationalMotto}>Cộng Hoà Xã Hội Chủ Nghĩa Việt Nam</Text>
          <Text style={styles.independenceMotto}>Độc lập - Tự do - Hạnh phúc</Text>
          <View style={styles.mottoUnderline} />
        </View>

        {/* === TIÊU ĐỀ HỢP ĐỒNG === */}
        <Text style={styles.title}>HỢP ĐỒNG HỢP TÁC</Text>

        {/* === THÔNG TIN CHUNG (Phần code cũ của bạn) === */}
        <View style={styles.section}>
          {/* Sửa 'Contracts' thành 'THÔNG TIN CHUNG' */}
          <Text style={styles.heading}>THÔNG TIN CHUNG</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.text}>
                <Text style={styles.label}>Số hợp đồng: </Text>
                {contract.contractNumber}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Tiêu đề: </Text>
                {contract.title}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Loại hợp đồng: </Text>
                {contract.contractType}
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.text}>
                <Text style={styles.label}>Ngày bắt đầu: </Text>
                {new Date(contract.startDate).toLocaleDateString('vi-VN')}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Ngày kết thúc: </Text>
                {new Date(contract.endDate).toLocaleDateString('vi-VN')}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.label}>Tỷ lệ hoa hồng: </Text>
                {contract.commissionRate}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* === THÔNG TIN CÁC BÊN === */}
        <View style={styles.section}>
          {/* Ghi rõ Bên A, Bên B */}
          <Text style={styles.heading}>THÔNG TIN BÊN QUẢN LÝ (BÊN A)</Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Tên quản lý: </Text>
            {contract.managerName}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Chức vụ: </Text>
            {contract.managerPosition}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Email: </Text>
            {contract.managerEmail}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>THÔNG TIN ĐỐI TÁC (BÊN B)</Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Tên đối tác: </Text>
            {contract.partnerName}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Địa chỉ: </Text>
            {contract.partnerAddress}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Mã số thuế: </Text>
            {contract.partnerTaxCode}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Người đại diện: </Text>
            {contract.partnerRepresentative}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Chức vụ: </Text>
            {contract.partnerPosition}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Email: </Text>
            {contract.partnerEmail}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Số điện thoại: </Text>
            {contract.partnerPhone || 'N/A'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* === ĐIỀU KHOẢN (Phần code cũ của bạn) === */}
        <View style={styles.section}>
          <Text style={styles.heading}>ĐIỀU KHOẢN CHÍNH</Text>
          <Text style={styles.text}>{contract.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>ĐIỀU KHOẢN & ĐIỀU KIỆN</Text>
          <Text>{contract.termsAndConditions}</Text>
        </View>

        {/* === PHẦN CHỮ KÝ MỚI === */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>ĐẠI DIỆN BÊN A</Text>
            <Text style={styles.signatureRole}>({contract.managerPosition})</Text>
            <Text style={styles.signatureName}>{contract.managerName}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>ĐẠI DIỆN BÊN B</Text>
            <Text style={styles.signatureRole}>({contract.partnerPosition})</Text>
            <Text style={styles.signatureName}>{contract.partnerRepresentative}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ContractDocument;