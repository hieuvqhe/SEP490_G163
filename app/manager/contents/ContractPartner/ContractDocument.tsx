"use client";

import { Document, Page, StyleSheet, Text, View, Font } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

import type { ContractDetail } from '@/apis/manager.contract.api';

// Đăng ký font Roboto (giữ nguyên như code của bạn)
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf', // Roboto Regular
    },
    {
      src: '/fonts/Roboto-Bold.ttf', // Roboto Bold
      fontWeight: 'bold',
    },
    {
      src: '/fonts/Roboto-Italic.ttf', // Roboto Italic
      fontStyle: 'italic',
    },
    {
      src: '/fonts/Roboto-BoldItalic.ttf', // Roboto Bold Italic
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 12,
    fontFamily: 'Roboto',
    lineHeight: 1.5,
    color: '#000000',
  },
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
    width: 170,
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
  section: {
    marginBottom: 18,
  },
  subSection: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 6,
  },
  italicParagraph: {
    marginBottom: 6,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  column: {
    flexDirection: 'column',
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listBullet: {
    width: 18,
    fontWeight: 'bold',
  },
  listContent: {
    flex: 1,
  },
  clauseContainer: {
    marginBottom: 12,
  },
  clauseTitle: {
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    marginVertical: 12,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 48,
    gap: 24,
  },
  signatureBlock: {
    flex: 1,
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
    marginBottom: 54,
  },
  signatureName: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
});

type MaybeString = string | null | undefined;

interface ContractTemplateClauseSubItem {
  soMucCon?: string;
  tieuDe?: string;
  noiDung?: string | string[];
  trachNhiem?: string[];
  chiTiet?: string[];
}

interface ContractTemplateClauseItem {
  soMuc?: string;
  tieuDe?: string;
  noiDung?: string | string[];
  chiTietHopTac?: string[];
  uuTienGiaiThich?: string[];
  khangDinh?: string;
  chiTiet?: (string | ContractTemplateClauseSubItem)[];
  trachNhiem?: string[];
  dieuKien?: string[];
}

interface ContractTemplateClause {
  soDieu: string;
  tieuDe?: string;
  noiDung?: string | string[];
  chiTiet?: string[];
  cacMuc?: ContractTemplateClauseItem[];
}

interface ContractTemplatePartyInfo {
  tenGoi?: string;
  tenCongTy?: string;
  daiDien?: string;
  chucVu?: string;
  diaChi?: string;
  dienThoai?: string;
  email?: string;
  taiKhoanSo?: string;
  maSoThue?: string;
  diaChiDangKy_Raw?: string;
  diaChiGiaoDich_Raw?: string;
  dienThoai_Raw?: string;
  taiKhoanSo_Raw?: string;
  emailDangKy_Raw?: string;
}

interface ContractTemplateParties {
  benA?: ContractTemplatePartyInfo;
  benB?: ContractTemplatePartyInfo;
  dinhNghiaTenGoi?: string;
}

export interface ContractTemplate {
  quocHieu?: string;
  tieuNgu?: string;
  tieuDeChinh: string;
  cacBenThamGia?: string[];
  mucDich?: string;
  thongTinKyKet?: {
    moTa?: string;
    ngayLap?: string;
    diaDiem?: string;
  };
  thongTinChung?: {
    tieuDe: string;
    chiTiet?: {
      soHopDong?: string;
      loaiHopDong?: string;
      ngayBatDau?: string;
      ngayKetThuc?: string;
      tyLeHoaHong?: string;
    };
  };
  thongTinCacBen?: ContractTemplateParties;
  danNhap?: { muc?: string; noiDung: string }[];
  cacDieuKhoan?: ContractTemplateClause[];
  chuKy?: {
    benA?: { chucDanh?: string; ten?: string };
    benB?: { chucDanh?: string; ten?: string };
  };
}

interface ContractDocumentProps {
  contract: ContractDetail;
  template: ContractTemplate;
}

const replacePlaceholder = (rawValue: string | null | undefined, actualValue?: string | number | null) => {
  if (actualValue === undefined || actualValue === null || actualValue === '') {
    return rawValue ?? '';
  }

  if (typeof rawValue === 'string' && rawValue.match(/\[[\.]+\]/)) {
    return rawValue.replace(/\[[\.]+\]/g, String(actualValue));
  }

  if (!rawValue || rawValue.trim().length === 0) {
    return String(actualValue);
  }

  return `${rawValue} ${String(actualValue)}`.trim();
};

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const renderParagraphs = (
  value: string | string[] | undefined,
  keyPrefix: string,
  marginLeft = 0
): ReactElement[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(isNonEmptyString).map((item, index) => (
      <Text key={`${keyPrefix}-paragraph-${index}`} style={[styles.paragraph, { marginLeft }]}> 
        {item}
      </Text>
    ));
  }

  if (!isNonEmptyString(value)) {
    return [];
  }

  return [
    <Text key={`${keyPrefix}-paragraph`} style={[styles.paragraph, { marginLeft }]}> 
      {value}
    </Text>,
  ];
};

const renderBulletList = (items: string[] | undefined, keyPrefix: string, marginLeft = 0): ReactElement[] => {
  if (!items?.length) {
    return [];
  }

  return items.filter(isNonEmptyString).map((item, index) => (
    <View key={`${keyPrefix}-bullet-${index}`} style={[styles.listItem, { marginLeft }]}> 
      <Text style={styles.listBullet}>•</Text>
      <Text style={styles.listContent}>{item}</Text>
    </View>
  ));
};

const renderClauseSubItems = (
  subItems: (string | ContractTemplateClauseSubItem)[] | undefined,
  parentKey: string,
  level: number
): ReactElement[] => {
  if (!subItems?.length) {
    return [];
  }

  const marginLeft = Math.max(level, 0) * 12;

  return subItems.flatMap((item, index) => {
    const key = `${parentKey}-sub-${index}`;

    if (typeof item === 'string') {
      if (!isNonEmptyString(item)) {
        return [];
      }

      return [
        <View key={`${key}-string`} style={[styles.listItem, { marginLeft }]}> 
          <Text style={styles.listBullet}>•</Text>
          <Text style={styles.listContent}>{item}</Text>
        </View>,
      ];
    }

    const elements: ReactElement[] = [];
    const header = [item.soMucCon, item.tieuDe].filter(isNonEmptyString).join(' - ');
    const nestedMarginLeft = marginLeft + 12;

    if (header) {
      elements.push(
        <Text key={`${key}-header`} style={[styles.subHeading, { marginLeft }]}> 
          {header}
        </Text>
      );
    }

    elements.push(...renderParagraphs(item.noiDung, `${key}-noi-dung`, nestedMarginLeft));
    elements.push(...renderBulletList(item.trachNhiem, `${key}-trach-nhiem`, nestedMarginLeft));
    elements.push(...renderBulletList(item.chiTiet, `${key}-chi-tiet`, nestedMarginLeft));

    return elements;
  });
};

const renderClauseItems = (
  items: ContractTemplateClauseItem[] | undefined,
  parentKey: string,
  level = 0
): ReactElement[] => {
  if (!items?.length) {
    return [];
  }

  const marginLeft = Math.max(level, 0) * 12;
  const contentMarginLeft = marginLeft + 12;

  return items.flatMap((item, index) => {
    const key = `${parentKey}-item-${index}`;
    const elements: ReactElement[] = [];
    const title = [item.soMuc, item.tieuDe].filter(isNonEmptyString).join(' - ');

    if (title) {
      elements.push(
        <Text key={`${key}-title`} style={[styles.subHeading, { marginLeft }]}> 
          {title}
        </Text>
      );
    }

    elements.push(...renderParagraphs(item.noiDung, `${key}-noi-dung`, contentMarginLeft));
    if (item.khangDinh && isNonEmptyString(item.khangDinh)) {
      elements.push(
        <Text key={`${key}-khang-dinh`} style={[styles.italicParagraph, { marginLeft: contentMarginLeft }]}> 
          {item.khangDinh}
        </Text>
      );
    }

    elements.push(...renderBulletList(item.chiTietHopTac, `${key}-chi-tiet-hop-tac`, contentMarginLeft));
    elements.push(...renderBulletList(item.uuTienGiaiThich, `${key}-uu-tien-giai-thich`, contentMarginLeft));
    elements.push(...renderClauseSubItems(item.chiTiet, key, level + 2));
    elements.push(...renderBulletList(item.trachNhiem, `${key}-trach-nhiem`, contentMarginLeft));
    elements.push(...renderBulletList(item.dieuKien, `${key}-dieu-kien`, contentMarginLeft));

    return elements;
  });
};

const renderClause = (clause: ContractTemplateClause, index: number): ReactElement => {
  const keyPrefix = `clause-${index}`;
  const elements: ReactElement[] = [];
  const title = [clause.soDieu, clause.tieuDe].filter(isNonEmptyString).join(' - ');

  if (title) {
    elements.push(
      <Text key={`${keyPrefix}-title`} style={styles.clauseTitle}> 
        {title}
      </Text>
    );
  }

  elements.push(...renderParagraphs(clause.noiDung, `${keyPrefix}-noi-dung`));
  elements.push(...renderBulletList(clause.chiTiet, `${keyPrefix}-chi-tiet`, 12));
  elements.push(...renderClauseItems(clause.cacMuc, keyPrefix));

  return (
    <View key={keyPrefix} style={styles.clauseContainer}>
      {elements}
    </View>
  );
};

const getLineContent = (rawValue: MaybeString, actualValue?: string | number | null) => {
  const actualText = actualValue !== undefined && actualValue !== null ? String(actualValue).trim() : '';

  if (!isNonEmptyString(rawValue)) {
    return actualText;
  }

  if (rawValue.match(/\[[\.]+\]/)) {
    return replacePlaceholder(rawValue, actualText || undefined).trim();
  }

  if (!actualText) {
    return rawValue.trim();
  }

  return `${rawValue} ${actualText}`.trim();
};

const sanitizeCompanySegment = (value: MaybeString): string => {
  if (!isNonEmptyString(value)) {
    return 'CTY';
  }

  const asciiValue = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return asciiValue.slice(0, 5) || 'CTY';
};

const generateContractNumber = (contract: ContractDetail): string => {
  const baseDate = contract.startDate ?? contract.createdAt ?? '';
  const parsedDate = baseDate ? new Date(baseDate) : new Date();
  const year = Number.isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear();
  const sequence = String(contract.contractId ?? 0).padStart(3, '0');
  const companySegment = sanitizeCompanySegment(contract.partnerName ?? contract.companyName ?? '');

  return `HD-${year}-${sequence}-${companySegment}`;
};

const getContractNumberDisplay = (contract: ContractDetail): string => {
  const rawNumber = (contract.contractNumber ?? '').trim();

  return rawNumber || 'Nhập số hợp đồng';
};

const partyFieldLabels: Partial<Record<keyof ContractTemplatePartyInfo, string>> = {
  tenCongTy: 'Tên công ty',
  daiDien: 'Đại diện',
  chucVu: 'Chức vụ',
  diaChi: 'Địa chỉ',
  dienThoai: 'Số điện thoại cá nhân',
  email: 'Email',
  taiKhoanSo: 'Tài khoản',
  maSoThue: 'Mã số thuế',
  diaChiDangKy_Raw: 'Địa chỉ đăng ký',
  diaChiGiaoDich_Raw: 'Địa chỉ giao dịch',
  dienThoai_Raw: 'Số điện thoại đăng ký',
  taiKhoanSo_Raw: 'Tài khoản đăng ký',
  emailDangKy_Raw: 'Email đăng ký',
};

const formatPartyField = (
  rawValue: MaybeString,
  actualValue: MaybeString | number | undefined,
  fallbackLabel?: string
): string => {
  const actualText =
    actualValue !== undefined && actualValue !== null ? String(actualValue).trim() : '';
  const rawText = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!actualText) {
    if (rawText && /\[[\.]+\]/.test(rawText)) {
      return '';
    }
    return rawText;
  }

  let line = '';

  if (fallbackLabel && /\[[\.]+\]/.test(rawText)) {
    return `${fallbackLabel}: ${actualText}`.trim();
  }

  if (rawText) {
    if (/\[[\.]+\]/.test(rawText)) {
      line = rawText.replace(/\[[\.]+\]/g, actualText);
    } else if (rawText.includes(':')) {
      const [rawLabel] = rawText.split(':');
      const label = rawLabel.trim() || fallbackLabel;
      line = label ? `${label}: ${actualText}` : actualText;
    } else {
      if (fallbackLabel) {
        line = `${fallbackLabel}: ${actualText}`;
      } else {
        line = `${rawText} ${actualText}`.trim();
      }
    }
  } else {
    line = fallbackLabel ? `${fallbackLabel}: ${actualText}` : actualText;
  }

  line = line.replace(/\s+/g, ' ').trim();

  if (!line) {
    return '';
  }

  if (fallbackLabel) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const currentLabel = line.slice(0, colonIndex).trim();
      const valuePart = line.slice(colonIndex + 1).trim();
      if (currentLabel.toLowerCase() !== fallbackLabel.toLowerCase()) {
        return `${fallbackLabel}: ${valuePart}`.trim();
      }
      return `${currentLabel}: ${valuePart}`.trim();
    }

    return `${fallbackLabel}: ${line}`.trim();
  }

  return line;
};

const buildPartyLines = (
  info: ContractTemplatePartyInfo | undefined,
  dynamicValues: Partial<Record<keyof ContractTemplatePartyInfo, MaybeString | number>>
): string[] => {
  if (!info) {
    return [];
  }

  const fields: (keyof ContractTemplatePartyInfo)[] = [
    'tenCongTy',
    'daiDien',
    'chucVu',
    'diaChi',
    'dienThoai',
    'email',
    'taiKhoanSo',
    'maSoThue',
    'diaChiDangKy_Raw',
    'diaChiGiaoDich_Raw',
    'dienThoai_Raw',
    'taiKhoanSo_Raw',
    'emailDangKy_Raw',
  ];

  return fields
    .map((field) => {
      const templateValue = info[field];
      const actualValue = dynamicValues[field];
      const fallbackLabel = partyFieldLabels[field];

      return formatPartyField(templateValue, actualValue ?? undefined, fallbackLabel);
    })
    .filter(isNonEmptyString);
};

const ContractDocument = ({ contract, template }: ContractDocumentProps) => {
  const {
    quocHieu,
    tieuNgu,
    tieuDeChinh,
    cacBenThamGia,
    mucDich,
    thongTinKyKet,
    thongTinChung,
    thongTinCacBen,
    danNhap,
    cacDieuKhoan,
    chuKy,
  } = template;

  const quocHieuLines = [quocHieu, tieuNgu].filter(isNonEmptyString);

  const thongTinChungDetails: Partial<NonNullable<ContractTemplate['thongTinChung']>['chiTiet']> =
    thongTinChung?.chiTiet ?? {};

  const formattedStartDate = contract.startDate
    ? new Date(contract.startDate).toLocaleDateString('vi-VN')
    : '';
  const formattedEndDate = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString('vi-VN')
    : '';

  const thongTinChungRows = [
    {
      label: 'Số hợp đồng',
      value: getLineContent(
        thongTinChungDetails.soHopDong ?? null,
        getContractNumberDisplay(contract)
      ),
    },
    {
      label: 'Loại hợp đồng',
      value: getLineContent(thongTinChungDetails.loaiHopDong ?? null, contract.contractType),
    },
    {
      label: 'Ngày bắt đầu',
      value: getLineContent(thongTinChungDetails.ngayBatDau ?? null, formattedStartDate),
    },
    {
      label: 'Ngày kết thúc',
      value: getLineContent(thongTinChungDetails.ngayKetThuc ?? null, formattedEndDate),
    },
    {
      label: 'Tỷ lệ hoa hồng',
      value: getLineContent(thongTinChungDetails.tyLeHoaHong ?? null, `${contract.commissionRate}%`),
    },
  ].filter((row) => isNonEmptyString(row.value));

  const benATemplate = thongTinCacBen?.benA;
  const benBTemplate = thongTinCacBen?.benB;

  const benALines = buildPartyLines(benATemplate, {
    tenCongTy: contract.companyName,
    daiDien: contract.managerName,
    chucVu: contract.managerPosition,
    diaChi: contract.companyAddress,
    email: contract.managerEmail,
    maSoThue: contract.companyTaxCode,
  });

  const benBLines = buildPartyLines(benBTemplate, {
    tenCongTy: contract.partnerName,
    daiDien: contract.partnerRepresentative,
    chucVu: contract.partnerPosition,
    diaChiDangKy_Raw: contract.partnerAddress,
    maSoThue: contract.partnerTaxCode,
    emailDangKy_Raw: contract.partnerEmail,
    dienThoai_Raw: contract.partnerPhone,
  });

  const thongTinKyKetRows = [
    { label: 'Ngày lập', value: thongTinKyKet?.ngayLap },
    { label: 'Địa điểm', value: thongTinKyKet?.diaDiem },
  ].filter((row) => isNonEmptyString(row.value));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {quocHieuLines.map((line, index) => (
            <Text key={`quoc-hieu-${index}`} style={index === 0 ? styles.nationalMotto : styles.independenceMotto}>
              {line}
            </Text>
          ))}
          <View style={styles.mottoUnderline} />
        </View>

        <Text style={styles.title}>{tieuDeChinh}</Text>

        {renderBulletList(cacBenThamGia, 'cac-ben-tham-gia')}

        {isNonEmptyString(mucDich) ? (
          <View style={styles.section}>
            <Text style={styles.heading}>MỤC ĐÍCH HỢP TÁC</Text>
            <Text style={styles.paragraph}>{mucDich}</Text>
          </View>
        ) : null}

        {isNonEmptyString(thongTinKyKet?.moTa) || thongTinKyKetRows.length ? (
          <View style={styles.section}>
            <Text style={styles.heading}>THÔNG TIN KÝ KẾT</Text>
            {isNonEmptyString(thongTinKyKet?.moTa) ? (
              <Text style={styles.paragraph}>{thongTinKyKet?.moTa}</Text>
            ) : null}
            {thongTinKyKetRows.map((row) => (
              <Text key={row.label} style={styles.paragraph}>
                <Text style={styles.label}>{row.label}: </Text>
                {row.value}
              </Text>
            ))}
          </View>
        ) : null}

        {thongTinChungRows.length ? (
          <View style={styles.section}>
            <Text style={styles.heading}>{thongTinChung?.tieuDe ?? 'Thông tin chung về hợp đồng'}</Text>
            <View style={styles.row}>
              <View style={styles.column}>
                {thongTinChungRows.slice(0, Math.ceil(thongTinChungRows.length / 2)).map(({ label, value }) => (
                  <Text key={label} style={styles.paragraph}>
                    <Text style={styles.label}>{label}: </Text>
                    {value}
                  </Text>
                ))}
              </View>
              <View style={styles.column}>
                {thongTinChungRows.slice(Math.ceil(thongTinChungRows.length / 2)).map(({ label, value }) => (
                  <Text key={label} style={styles.paragraph}>
                    <Text style={styles.label}>{label}: </Text>
                    {value}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {benALines.length || benBLines.length ? (
          <View style={styles.section}>
            <Text style={styles.heading}>THÔNG TIN CÁC BÊN</Text>
            <View style={styles.subSection}>
              <Text style={styles.subHeading}>{benATemplate?.tenGoi ?? 'BÊN A'}</Text>
              {benALines.map((line, index) => (
                <Text key={`ben-a-line-${index}`} style={styles.paragraph}>
                  {line}
                </Text>
              ))}
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subHeading}>{benBTemplate?.tenGoi ?? 'BÊN B'}</Text>
              {benBLines.map((line, index) => (
                <Text key={`ben-b-line-${index}`} style={styles.paragraph}>
                  {line}
                </Text>
              ))}
            </View>

            {isNonEmptyString(thongTinCacBen?.dinhNghiaTenGoi) ? (
              <Text style={styles.paragraph}>{thongTinCacBen?.dinhNghiaTenGoi}</Text>
            ) : null}
          </View>
        ) : null}

        {danNhap?.length ? (
          <View style={styles.section}>
            <Text style={styles.heading}>DẪN NHẬP</Text>
            {danNhap.map((item, index) => (
              <View key={`dan-nhap-${index}`} style={styles.listItem}>
                <Text style={styles.listBullet}>{item.muc ?? '•'}</Text>
                <Text style={styles.listContent}>{item.noiDung}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {cacDieuKhoan?.map((clause, index) => renderClause(clause, index))}

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.heading}>THÔNG TIN BỔ SUNG TỪ HỆ THỐNG</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.label}>Mô tả hợp đồng: </Text>
            {contract.description}
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.label}>Điều khoản &amp; Điều kiện: </Text>
            {contract.termsAndConditions}
          </Text>
        </View>

        <View style={styles.signatureContainer}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>
              {chuKy?.benA?.chucDanh ?? 'ĐẠI DIỆN BÊN A'}
            </Text>
            <Text style={styles.signatureRole}>({contract.managerPosition})</Text>
            <Text style={styles.signatureName}>
              {contract.managerName || chuKy?.benA?.ten || ''}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>
              {chuKy?.benB?.chucDanh ?? 'ĐẠI DIỆN BÊN B'}
            </Text>
            <Text style={styles.signatureRole}>({contract.partnerPosition})</Text>
            <Text style={styles.signatureName}>
              {contract.partnerRepresentative || chuKy?.benB?.ten || ''}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ContractDocument;