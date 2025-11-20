using EmployeeMvp.DTOs;

namespace EmployeeMvp.Services;

public interface IReportService
{
    Task<byte[]> GenerateEmployeeReportAsync(ReportRequest request, string generatedBy);
    Task<byte[]> GenerateAttendanceReportAsync(ReportRequest request, string generatedBy);
    Task<byte[]> GeneratePayrollReportAsync(ReportRequest request, string generatedBy);
    Task<byte[]> GenerateLeaveReportAsync(ReportRequest request, string generatedBy);
}
