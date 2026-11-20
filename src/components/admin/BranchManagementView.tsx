import React, { useState, useEffect, useCallback } from 'react';
import {
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
} from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { branchService, type Branch } from '../../services/branch.service';
import { classroomService } from '../../services/classroom.service';
import { shiftSlotService } from '../../services/shiftSlot.service';
import { BranchTab } from './facility/BranchTab';
import { ClassroomTab } from './facility/ClassroomTab';
import { ShiftSlotTab } from './facility/ShiftSlotTab';

const { Title, Paragraph } = Typography;

export const BranchManagementView: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<string>('branches');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [totalClassrooms, setTotalClassrooms] = useState<number>(0);
  const [totalShiftSlots, setTotalShiftSlots] = useState<number>(0);

  // Load danh sách cơ sở
  const fetchBranches = useCallback(async () => {
    setBranchLoading(true);
    try {
      const res = await branchService.getAllBranches();
      setBranches(res.data || []);
    } catch {
      // Handled in subcomponent
    } finally {
      setBranchLoading(false);
    }
  }, []);

  // Load tổng số phòng học và ca học
  const fetchCounts = useCallback(async () => {
    try {
      const [classRes, shiftRes] = await Promise.all([
        classroomService.getAllClassrooms(),
        shiftSlotService.getAllShiftSlots(),
      ]);
      setTotalClassrooms(classRes.data?.length || 0);
      setTotalShiftSlots(shiftRes.data?.length || 0);
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    fetchBranches();
    fetchCounts();
  }, [fetchBranches, fetchCounts]);

  const tabItems = [
    {
      key: 'branches',
      label: (
        <span className="flex items-center gap-2 font-bold px-1 py-1">
          <ShopOutlined className="text-rose-600" />
          <span>1. Cơ Sở & Chi Nhánh</span>
          <span className="text-[11px] px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
            {branches.length}
          </span>
        </span>
      ),
      children: (
        <BranchTab
          branches={branches}
          loading={branchLoading}
          onRefresh={fetchBranches}
        />
      ),
    },
    {
      key: 'classrooms',
      label: (
        <span className="flex items-center gap-2 font-bold px-1 py-1">
          <AppstoreOutlined className="text-pink-600" />
          <span>2. Phòng Học & Sức Chứa</span>
          <span className="text-[11px] px-2 py-0.2 rounded-full bg-pink-100 text-pink-700 font-bold">
            {totalClassrooms}
          </span>
        </span>
      ),
      children: (
        <ClassroomTab branches={branches} />
      ),
    },
    {
      key: 'shiftSlots',
      label: (
        <span className="flex items-center gap-2 font-bold px-1 py-1">
          <FieldTimeOutlined className="text-amber-600" />
          <span>3. Ca Học Chuẩn (Sáng - Chiều - Tối)</span>
          <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-700 font-bold">
            {totalShiftSlots}
          </span>
        </span>
      ),
      children: (
        <ShiftSlotTab />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Hệ Thống Cơ Sở Vật Chất & Lịch Học
              </span>
            </div>
            <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>
              Thiết Lập Cơ Sở, Phòng Học & Ca Học Chuẩn
            </Title>
            <Paragraph className="text-xs text-slate-500 mb-0 mt-1">
              Cấu hình các cơ sở/chi nhánh, phòng học, sức chứa và các ca học chuẩn (Sáng, Chiều, Tối) phục vụ công tác xếp thời khóa biểu giảng dạy.
            </Paragraph>
          </div>
        </div>
      </div>

      {/* Summary KPI Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-rose-100 shadow-xs bg-white hover:border-rose-300 transition-all">
            <Statistic
              title={<span className="text-xs font-semibold text-slate-500">Cơ Sở & Chi Nhánh</span>}
              value={branches.length}
              prefix={<ShopOutlined className="text-rose-500 mr-2" />}
              valueStyle={{ color: '#0f172a', fontWeight: 800 }}
              suffix={<span className="text-xs text-slate-400 font-normal">địa điểm</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-rose-100 shadow-xs bg-white hover:border-pink-300 transition-all">
            <Statistic
              title={<span className="text-xs font-semibold text-slate-500">Phòng Học Sẵn Sàng</span>}
              value={totalClassrooms}
              prefix={<AppstoreOutlined className="text-pink-500 mr-2" />}
              valueStyle={{ color: '#e11d48', fontWeight: 800 }}
              suffix={<span className="text-xs text-slate-400 font-normal">phòng học</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-2xl border-rose-100 shadow-xs bg-white hover:border-amber-300 transition-all">
            <Statistic
              title={<span className="text-xs font-semibold text-slate-500">Khung Ca Học Quy Định</span>}
              value={totalShiftSlots}
              prefix={<FieldTimeOutlined className="text-amber-500 mr-2" />}
              valueStyle={{ color: '#d97706', fontWeight: 800 }}
              suffix={<span className="text-xs text-slate-400 font-normal">ca chuẩn (Sáng/Chiều/Tối)</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Tabbed Interface */}
      <div className="bg-white rounded-3xl border border-rose-100 p-4 shadow-sm">
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          items={tabItems}
          type="card"
          className="facility-tabs"
        />
      </div>
    </div>
  );
};
