// API Client for .NET Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

class ApiClient {
  public baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`🔵 .NET API Request: ${options?.method || 'GET'} ${url}`);
      
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        console.error(`❌ .NET API Error: ${response.status}`, error);
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ .NET API Response: ${options?.method || 'GET'} ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error('❌ .NET API Error:', error);
      throw error;
    }
  }

  // Helper to normalize user data from API
  private normalizeUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName || user.full_name,
      fullName: user.fullName || user.full_name,
      role: user.role?.toLowerCase() || 'employee',
      avatar_url: user.avatarUrl || user.avatar_url,
      avatarUrl: user.avatarUrl || user.avatar_url,
    };
  }

  // Helper to normalize employee data from API
  private normalizeEmployee(emp: any) {
    return {
      id: emp.id,
      employee_code: emp.employeeCode || emp.employee_code,
      user_id: emp.userId || emp.user_id,
      department_id: emp.departmentId || emp.department_id,
      position: emp.position,
      hire_date: emp.hireDate || emp.hire_date,
      salary: emp.salary,
      status: emp.status || 'active',
      performance_rating: emp.performanceRating || emp.performance_rating,
      users: {
        full_name: emp.fullName || emp.employeeName || emp.employee_name || emp.userName || emp.user_name || 'Unknown',
        email: emp.email || emp.userEmail || emp.user_email || '',
        phone: emp.phone || ''
      },
      departments: {
        name: emp.departmentName || emp.department_name || 'N/A'
      }
    };
  }

  // Helper to normalize attendance data from API
  private normalizeAttendance(att: any) {
    return {
      id: att.id,
      employee_id: att.employeeId || att.employee_id,
      date: att.date,
      check_in_time: att.clockIn || att.check_in_time || att.clock_in,
      check_out_time: att.clockOut || att.check_out_time || att.clock_out,
      status: att.status,
      notes: att.notes,
      employees: {
        employee_code: att.employeeCode || att.employee_code || 'N/A',
        users: {
          full_name: att.employeeName || att.employee_name || 'Unknown'
        },
        departments: {
          name: att.departmentName || att.department_name || 'N/A'
        }
      }
    };
  }

  // Helper to normalize payroll data from API
  private normalizePayroll(pay: any) {
    return {
      id: pay.id,
      employee_id: pay.employeeId || pay.employee_id,
      month: pay.month?.toString() || '1',
      year: pay.year || new Date().getFullYear(),
      base_salary: pay.basicSalary || pay.base_salary || 0,
      bonus: pay.bonuses || pay.bonus || 0,
      deductions: pay.deductions || 0,
      net_pay: pay.netSalary || pay.net_pay || 0,
      payment_date: pay.paymentDate || pay.payment_date,
      status: pay.paymentStatus || pay.status || 'pending',
      employees: {
        employee_code: pay.employeeCode || pay.employee_code || 'N/A',
        users: [{
          full_name: pay.employeeName || pay.employee_name || 'Unknown'
        }],
        departments: [{
          name: pay.departmentName || pay.department_name || 'N/A'
        }]
      }
    };
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getUsers() {
    const response = await this.request<any[]>('/auth/users');
    // Normalize user data
    if (response.data) {
      response.data = response.data.map((user: any) => this.normalizeUser(user));
    }
    return response;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  // Employee endpoints
  async getEmployees() {
    const response = await this.request<any[]>('/employees');
    if (response.data) {
      response.data = response.data.map((emp: any) => this.normalizeEmployee(emp));
    }
    return response;
  }

  async getEmployee(id: string) {
    const response = await this.request<any>(`/employees/${id}`);
    if (response.data) {
      response.data = this.normalizeEmployee(response.data);
    }
    return response;
  }

  async createEmployee(data: any) {
    return this.request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request<any>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id: string) {
    return this.request<void>(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance endpoints
  async getAttendance() {
    const response = await this.request<any[]>('/attendance');
    if (response.data) {
      response.data = response.data.map((att: any) => this.normalizeAttendance(att));
    }
    return response;
  }

  async getAttendanceById(id: string) {
    const response = await this.request<any>(`/attendance/${id}`);
    if (response.data) {
      response.data = this.normalizeAttendance(response.data);
    }
    return response;
  }

  async getAttendanceByEmployee(employeeId: string) {
    const response = await this.request<any[]>(`/attendance/employee/${employeeId}`);
    if (response.data) {
      response.data = response.data.map((att: any) => this.normalizeAttendance(att));
    }
    return response;
  }

  async clockIn(employeeId: string, data?: { notes?: string }) {
    return this.request<any>('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ...data }),
    });
  }

  async clockOut(employeeId: string, data?: { notes?: string }) {
    return this.request<any>('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId, ...data }),
    });
  }

  async createAttendance(data: any) {
    return this.request<any>('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAttendance(id: string, data: any) {
    return this.request<any>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendance(id: string) {
    return this.request<void>(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  // Payroll endpoints
  async getPayroll() {
    const response = await this.request<any[]>('/payroll');
    if (response.data) {
      response.data = response.data.map((pay: any) => this.normalizePayroll(pay));
    }
    return response;
  }

  async getPayrollById(id: string) {
    const response = await this.request<any>(`/payroll/${id}`);
    if (response.data) {
      response.data = this.normalizePayroll(response.data);
    }
    return response;
  }

  async getPayrollByEmployee(employeeId: string) {
    const response = await this.request<any[]>(`/payroll/employee/${employeeId}`);
    if (response.data) {
      response.data = response.data.map((pay: any) => this.normalizePayroll(pay));
    }
    return response;
  }

  async createPayroll(data: any) {
    return this.request<any>('/payroll', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePayroll(id: string, data: any) {
    return this.request<any>(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePayroll(id: string) {
    return this.request<void>(`/payroll/${id}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications() {
    return this.request<any[]>('/notification');
  }

  async getUnreadNotifications() {
    return this.request<any[]>('/notification/unread');
  }

  async getUnreadNotificationCount() {
    return this.request<number>('/notification/unread/count');
  }

  async markNotificationAsRead(id: string) {
    return this.request<any>(`/notification/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<any>('/notification/read-all', {
      method: 'POST',
    });
  }

  async deleteNotification(id: string) {
    return this.request<void>(`/notification/${id}`, {
      method: 'DELETE',
    });
  }

  async clearReadNotifications() {
    return this.request<void>('/notification/clear-read', {
      method: 'DELETE',
    });
  }

  // Leave endpoints
  async getLeaves(status?: string) {
    const url = status ? `/leave?status=${status}` : '/leave';
    return this.request<any[]>(url);
  }

  async getPendingLeaves() {
    return this.request<any[]>('/leave/pending');
  }

  async getLeaveById(id: string) {
    return this.request<any>(`/leave/${id}`);
  }

  async requestLeave(data: any) {
    return this.request<any>('/leave', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveLeave(id: string) {
    return this.request<any>(`/leave/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectLeave(id: string, rejectionReason: string) {
    return this.request<any>(`/leave/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
  }

  async cancelLeave(id: string) {
    return this.request<void>(`/leave/${id}`, {
      method: 'DELETE',
    });
  }

  async getLeaveBalance(employeeId: string, year?: number) {
    const url = year ? `/leave/balance/${employeeId}?year=${year}` : `/leave/balance/${employeeId}`;
    return this.request<any>(url);
  }

  // ==================== Audit Logs ====================
  async getAuditLogs(query?: {
    userId?: string;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams();
    if (query?.userId) params.append('userId', query.userId);
    if (query?.entityType) params.append('entityType', query.entityType);
    if (query?.action) params.append('action', query.action);
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
    
    const url = `/audit${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<any>(url);
  }

  async getAuditLogById(id: string) {
    return this.request<any>(`/audit/${id}`);
  }

  async getAuditLogsByUser(userId: string, limit?: number) {
    const url = limit ? `/audit/user/${userId}?limit=${limit}` : `/audit/user/${userId}`;
    return this.request<any>(url);
  }

  async getAuditLogsByEntity(entityType: string, entityId: string, limit?: number) {
    const url = limit 
      ? `/audit/entity/${entityType}/${entityId}?limit=${limit}` 
      : `/audit/entity/${entityType}/${entityId}`;
    return this.request<any>(url);
  }

  async getRecentAuditLogs(limit?: number) {
    const url = limit ? `/audit/recent?limit=${limit}` : '/audit/recent';
    return this.request<any>(url);
  }
}

export const api = new ApiClient(API_BASE_URL);
