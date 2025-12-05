import React from 'react';
import { useQuery } from 'react-query';
import { Table, Button, Tag, Typography, Input, Modal } from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getReportByCustomer, getReportByConsumer } from '../../api/reports';
import { useCustomer, useConsumer } from '../../hooks';
import { ReportType, ReportStatus } from '../../types/api';
import { columns } from './VerificationReports.columns';
import './VerificationReports.css';

const { Title } = Typography;

interface VerificationReportsViewProps {
  customerId: string;
  consumerId?: string;
}

const VerificationReportsView: React.FC<VerificationReportsViewProps> = ({
  customerId,
  consumerId,
}) => {
  const [reportType, setReportType] = React.useState<ReportType | undefined>(
    undefined
  );
  const [reportStatus, setReportStatus] = React.useState<ReportStatus | undefined>(
    undefined
  );
  const [reportId, setReportId] = React.useState<string | undefined>(undefined);
  const [modalVisible, setModalVisible] = React.useState(false);

  const { data: customer } = useCustomer(customerId);
  const { data: consumer } = useConsumer(consumerId);

  const { data: reports, refetch } = useQuery(
    ['reports', customerId, consumerId],
    () => {
      if (consumerId) {
        return getReportByConsumer(consumerId);
      }
      return getReportByCustomer(customerId);
    }
  );

  const handleViewReport = React.useCallback((reportId: string, reportType: ReportType) => {
    setReportId(reportId);
    setReportType(reportType);
    setModalVisible(true);
  }, []);

  const handleDownloadReport = React.useCallback((reportId: string, reportType: ReportType) => {
    // TODO: Implement download logic
    alert(`Downloading report ${reportId} of type ${reportType}`);
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setModalVisible(false);
    setReportId(undefined);
    setReportType(undefined);
  }, []);

  const filteredReports = React.useMemo(() => {
    return (
      reports?.reports.filter(
        (report) =>
          (!reportType || report.type === reportType) &&
          (!reportStatus || report.status === reportStatus)
      ) || []
    );
  }, [reports, reportType, reportStatus]);

  const columnsWithActions = React.useMemo(
    () => [
      ...columns,
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: any) => (
          <>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewReport(record.id, record.type)}
              disabled={record.status !== 'success'}
            />
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadReport(record.id, record.type)}
              disabled={record.status !== 'success'}
            />
          </>
        ),
      },
    ],
    [handleViewReport, handleDownloadReport]
  );

  const handleReportTypeChange = (value: ReportType) => {
    setReportType(value);
  };

  const handleReportStatusChange = (value: ReportStatus) => {
    setReportStatus(value);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="verification-reports-view">
      <Title level={3}>Verification Reports</Title>
      <div className="filters">
        <Input.Group compact>
          <select
            placeholder="Report Type"
            onChange={(e) =>
              handleReportTypeChange(e.target.value as ReportType)
            }
            value={reportType || ''}
          >
            <option value="">All Report Types</option>
            <option value="voa">VOA</option>
            <option value="voi">VOI</option>
            <option value="voiePayroll">VOIE - Payroll</option>
            <option value="voePayroll">VOE - Payroll</option>
            <option value="paystatement">Pay Statement</option>
            <option value="transactions">Transactions</option>
          </select>
          <select
            placeholder="Report Status"
            onChange={(e) =>
              handleReportStatusChange(e.target.value as ReportStatus)
            }
            value={reportStatus || ''}
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="inProgress">In Progress</option>
            <option value="failure">Failure</option>
          </select>
        </Input.Group>
        <Button type="primary" onClick={handleRefresh}>
          Refresh
        </Button>
      </div>
      <Table
        dataSource={filteredReports}
        columns={columnsWithActions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={reportType ? `View Report - ${reportType}` : 'View Report'}
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width="80%"
      >
        {reportId && reportType && (
          <div className="report-viewer">
            <iframe
              src={`/api/reports/${reportId}?type=${reportType}`} // Adjust the URL based on your actual report fetching mechanism
              style={{ width: '100%', height: '600px', border: 'none' }}
              title="Report Viewer"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VerificationReportsView;
