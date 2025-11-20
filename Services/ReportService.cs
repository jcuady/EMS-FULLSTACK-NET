using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using EmployeeMvp.DTOs;
using EmployeeMvp.Repositories;

namespace EmployeeMvp.Services;

public class ReportService : IReportService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IPayrollRepository _payrollRepository;
    private readonly ILeaveRepository _leaveRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ReportService> _logger;

    public ReportService(
        IEmployeeRepository employeeRepository,
        IAttendanceRepository attendanceRepository,
        IPayrollRepository payrollRepository,
        ILeaveRepository leaveRepository,
        IUserRepository userRepository,
        ILogger<ReportService> logger)
    {
        _employeeRepository = employeeRepository;
        _attendanceRepository = attendanceRepository;
        _payrollRepository = payrollRepository;
        _leaveRepository = leaveRepository;
        _userRepository = userRepository;
        _logger = logger;

        // Configure QuestPDF license
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GenerateEmployeeReportAsync(ReportRequest request, string generatedBy)
    {
        try
        {
            var employees = await _employeeRepository.GetAllAsync();

            if (!string.IsNullOrEmpty(request.Department))
            {
                employees = employees.Where(e => e.Department?.Name != null && 
                    e.Department.Name.Equals(request.Department, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Note: Employee model doesn't have Status field - filtering removed

            var reportData = employees.Select(e => new EmployeeReportData
            {
                EmployeeCode = e.EmployeeCode,
                FullName = e.User?.FullName ?? "N/A",
                Email = e.User?.Email ?? "N/A",
                PhoneNumber = e.Phone ?? "N/A",
                Department = e.Department?.Name ?? "N/A",
                Position = e.Position,
                HireDate = e.HireDate,
                EmploymentType = e.EmploymentType,
                Status = "Active",  // Default to Active - add status field to Employee model if needed
                BaseSalary = e.Salary ?? 0
            }).ToList();

            var metadata = new ReportMetadata
            {
                ReportType = "Employee Report",
                ExportFormat = request.ExportFormat,
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = generatedBy,
                TotalRecords = reportData.Count,
                FilterCriteria = BuildFilterCriteria(request)
            };

            return request.ExportFormat.ToLower() == "pdf"
                ? GenerateEmployeePDF(reportData, metadata)
                : GenerateEmployeeExcel(reportData, metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating employee report");
            throw;
        }
    }

    public async Task<byte[]> GenerateAttendanceReportAsync(ReportRequest request, string generatedBy)
    {
        try
        {
            if (!request.StartDate.HasValue || !request.EndDate.HasValue)
            {
                throw new ArgumentException("Start date and end date are required for attendance reports");
            }

            // Get all attendance records and filter by date range
            var allAttendances = await _attendanceRepository.GetAllAsync();
            var attendances = allAttendances
                .Where(a => a.Date >= request.StartDate.Value && a.Date <= request.EndDate.Value)
                .ToList();

            if (!string.IsNullOrEmpty(request.EmployeeId))
            {
                attendances = attendances.Where(a => a.EmployeeId == request.EmployeeId).ToList();
            }

            var reportData = attendances.Select(a => new AttendanceReportData
            {
                EmployeeCode = a.Employee?.EmployeeCode ?? "N/A",
                EmployeeName = a.Employee?.User?.FullName ?? "N/A",
                Department = a.Employee?.Department?.Name ?? "N/A",
                Date = a.Date,
                ClockIn = a.ClockIn?.TimeOfDay,
                ClockOut = a.ClockOut?.TimeOfDay,
                Status = a.Status,
                Notes = a.Notes,
                WorkHours = a.ClockIn.HasValue && a.ClockOut.HasValue 
                    ? (decimal)(a.ClockOut.Value - a.ClockIn.Value).TotalHours 
                    : 0
            }).OrderBy(a => a.Date).ThenBy(a => a.EmployeeName).ToList();

            var metadata = new ReportMetadata
            {
                ReportType = "Attendance Report",
                ExportFormat = request.ExportFormat,
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = generatedBy,
                TotalRecords = reportData.Count,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                FilterCriteria = BuildFilterCriteria(request)
            };

            return request.ExportFormat.ToLower() == "pdf"
                ? GenerateAttendancePDF(reportData, metadata)
                : GenerateAttendanceExcel(reportData, metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating attendance report");
            throw;
        }
    }

    public async Task<byte[]> GeneratePayrollReportAsync(ReportRequest request, string generatedBy)
    {
        try
        {
            if (!request.StartDate.HasValue || !request.EndDate.HasValue)
            {
                throw new ArgumentException("Start date and end date are required for payroll reports");
            }

            // Get all payroll records and filter by date range
            var allPayrolls = await _payrollRepository.GetAllAsync();
            var payrolls = allPayrolls
                .Where(p => p.CreatedAt >= request.StartDate.Value && p.CreatedAt <= request.EndDate.Value)
                .ToList();

            if (!string.IsNullOrEmpty(request.EmployeeId))
            {
                payrolls = payrolls.Where(p => p.EmployeeId == request.EmployeeId).ToList();
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                payrolls = payrolls.Where(p => p.PaymentStatus.Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            var reportData = payrolls.Select(p => new PayrollReportData
            {
                EmployeeCode = p.Employee?.EmployeeCode ?? "N/A",
                EmployeeName = p.Employee?.User?.FullName ?? "N/A",
                Department = p.Employee?.Department?.Name ?? "N/A",
                Position = p.Employee?.Position ?? "N/A",
                BaseSalary = p.BasicSalary,
                Allowances = p.Allowances + p.Bonuses,
                Deductions = p.Deductions + p.Tax,
                NetSalary = p.NetSalary,
                PayrollDate = p.PaymentDate ?? p.CreatedAt,
                PayrollPeriod = $"{p.Year}-{p.Month:D2}",
                Status = p.PaymentStatus
            }).OrderBy(p => p.PayrollDate).ThenBy(p => p.EmployeeName).ToList();

            var metadata = new ReportMetadata
            {
                ReportType = "Payroll Report",
                ExportFormat = request.ExportFormat,
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = generatedBy,
                TotalRecords = reportData.Count,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                FilterCriteria = BuildFilterCriteria(request)
            };

            return request.ExportFormat.ToLower() == "pdf"
                ? GeneratePayrollPDF(reportData, metadata)
                : GeneratePayrollExcel(reportData, metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating payroll report");
            throw;
        }
    }

    public async Task<byte[]> GenerateLeaveReportAsync(ReportRequest request, string generatedBy)
    {
        try
        {
            var leaves = await _leaveRepository.GetAllAsync();

            if (request.StartDate.HasValue && request.EndDate.HasValue)
            {
                leaves = leaves.Where(l => l.StartDate >= request.StartDate.Value && l.EndDate <= request.EndDate.Value).ToList();
            }

            if (!string.IsNullOrEmpty(request.EmployeeId))
            {
                leaves = leaves.Where(l => l.EmployeeId == request.EmployeeId).ToList();
            }

            if (!string.IsNullOrEmpty(request.Status))
            {
                leaves = leaves.Where(l => l.Status.Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            var reportData = new List<LeaveReportData>();

            foreach (var leave in leaves)
            {
                var approverName = "N/A";
                if (!string.IsNullOrEmpty(leave.ApprovedBy))
                {
                    var approver = await _userRepository.GetByIdAsync(leave.ApprovedBy);
                    approverName = approver?.FullName ?? "N/A";
                }

                reportData.Add(new LeaveReportData
                {
                    EmployeeCode = leave.Employee?.EmployeeCode ?? "N/A",
                    EmployeeName = leave.Employee?.User?.FullName ?? "N/A",
                    Department = leave.Employee?.Department?.Name ?? "N/A",
                    LeaveType = leave.LeaveType,
                    StartDate = leave.StartDate,
                    EndDate = leave.EndDate,
                    DaysCount = leave.DaysCount,
                    Status = leave.Status,
                    ApprovedBy = approverName,
                    ApprovedAt = leave.ApprovedAt,
                    Reason = leave.Reason
                });
            }

            reportData = reportData.OrderBy(l => l.StartDate).ThenBy(l => l.EmployeeName).ToList();

            var metadata = new ReportMetadata
            {
                ReportType = "Leave Report",
                ExportFormat = request.ExportFormat,
                GeneratedAt = DateTime.UtcNow,
                GeneratedBy = generatedBy,
                TotalRecords = reportData.Count,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                FilterCriteria = BuildFilterCriteria(request)
            };

            return request.ExportFormat.ToLower() == "pdf"
                ? GenerateLeavePDF(reportData, metadata)
                : GenerateLeaveExcel(reportData, metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating leave report");
            throw;
        }
    }

    #region PDF Generation

    private byte[] GenerateEmployeePDF(List<EmployeeReportData> data, ReportMetadata metadata)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeHeader(c, metadata));
                page.Content().Element(c => ComposeEmployeeContent(c, data));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private byte[] GenerateAttendancePDF(List<AttendanceReportData> data, ReportMetadata metadata)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeHeader(c, metadata));
                page.Content().Element(c => ComposeAttendanceContent(c, data));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private byte[] GeneratePayrollPDF(List<PayrollReportData> data, ReportMetadata metadata)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeHeader(c, metadata));
                page.Content().Element(c => ComposePayrollContent(c, data));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private byte[] GenerateLeavePDF(List<LeaveReportData> data, ReportMetadata metadata)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeHeader(c, metadata));
                page.Content().Element(c => ComposeLeaveContent(c, data));
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private void ComposeHeader(IContainer container, ReportMetadata metadata)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text(metadata.ReportType).FontSize(20).Bold();
                column.Item().Text($"Generated: {metadata.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC").FontSize(9);
                column.Item().Text($"Generated By: {metadata.GeneratedBy}").FontSize(9);
                if (!string.IsNullOrEmpty(metadata.FilterCriteria))
                {
                    column.Item().Text($"Filters: {metadata.FilterCriteria}").FontSize(9);
                }
            });

            row.ConstantItem(100).AlignRight().Column(column =>
            {
                column.Item().Text($"Total Records: {metadata.TotalRecords}").FontSize(10).Bold();
            });
        });
    }

    private void ComposeEmployeeContent(IContainer container, List<EmployeeReportData> data)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(60);  // Code
                columns.RelativeColumn(1.5f); // Name
                columns.RelativeColumn(1.5f); // Email
                columns.RelativeColumn(1f);   // Department
                columns.RelativeColumn(1f);   // Position
                columns.ConstantColumn(80);   // Hire Date
                columns.ConstantColumn(70);   // Type
                columns.ConstantColumn(70);   // Status
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Code").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Name").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Email").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Department").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Position").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Hire Date").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Type").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Status").Bold();
            });

            foreach (var item in data)
            {
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeCode);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.FullName);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Email);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Department);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Position);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.HireDate.ToString("yyyy-MM-dd"));
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmploymentType);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Status);
            }
        });
    }

    private void ComposeAttendanceContent(IContainer container, List<AttendanceReportData> data)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(60);  // Code
                columns.RelativeColumn(1.2f); // Name
                columns.RelativeColumn(1f);   // Department
                columns.ConstantColumn(80);   // Date
                columns.ConstantColumn(60);   // Clock In
                columns.ConstantColumn(60);   // Clock Out
                columns.ConstantColumn(60);   // Hours
                columns.ConstantColumn(70);   // Status
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Code").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Name").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Department").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Date").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Clock In").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Clock Out").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Hours").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Status").Bold();
            });

            foreach (var item in data)
            {
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeCode);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeName);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Department);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Date.ToString("yyyy-MM-dd"));
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.ClockIn?.ToString(@"hh\:mm") ?? "-");
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.ClockOut?.ToString(@"hh\:mm") ?? "-");
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.WorkHours.ToString("0.0"));
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Status);
            }
        });
    }

    private void ComposePayrollContent(IContainer container, List<PayrollReportData> data)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(60);  // Code
                columns.RelativeColumn(1.2f); // Name
                columns.RelativeColumn(1f);   // Department
                columns.ConstantColumn(80);   // Period
                columns.ConstantColumn(70);   // Base Salary
                columns.ConstantColumn(70);   // Allowances
                columns.ConstantColumn(70);   // Deductions
                columns.ConstantColumn(70);   // Net Salary
                columns.ConstantColumn(70);   // Status
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Code").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Name").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Department").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Period").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Base").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Allowances").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Deductions").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Net").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Status").Bold();
            });

            foreach (var item in data)
            {
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeCode);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeName);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Department);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.PayrollPeriod);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"${item.BaseSalary:N2}");
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"${item.Allowances:N2}");
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"${item.Deductions:N2}");
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text($"${item.NetSalary:N2}");
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Status);
            }
        });
    }

    private void ComposeLeaveContent(IContainer container, List<LeaveReportData> data)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(60);  // Code
                columns.RelativeColumn(1.2f); // Name
                columns.RelativeColumn(1f);   // Department
                columns.ConstantColumn(70);   // Type
                columns.ConstantColumn(80);   // Start Date
                columns.ConstantColumn(80);   // End Date
                columns.ConstantColumn(50);   // Days
                columns.ConstantColumn(70);   // Status
                columns.RelativeColumn(1f);   // Approved By
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Code").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Name").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Department").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Type").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Start Date").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("End Date").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Days").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Status").Bold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Approved By").Bold();
            });

            foreach (var item in data)
            {
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeCode);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EmployeeName);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Department);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.LeaveType);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.StartDate.ToString("yyyy-MM-dd"));
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.EndDate.ToString("yyyy-MM-dd"));
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.DaysCount.ToString());
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.Status);
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(item.ApprovedBy ?? "-");
            }
        });
    }

    #endregion

    #region Excel Generation

    private byte[] GenerateEmployeeExcel(List<EmployeeReportData> data, ReportMetadata metadata)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Employee Report");

        // Header
        worksheet.Cell(1, 1).Value = metadata.ReportType;
        worksheet.Cell(1, 1).Style.Font.FontSize = 16;
        worksheet.Cell(1, 1).Style.Font.Bold = true;

        worksheet.Cell(2, 1).Value = $"Generated: {metadata.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC";
        worksheet.Cell(3, 1).Value = $"Generated By: {metadata.GeneratedBy}";
        worksheet.Cell(4, 1).Value = $"Total Records: {metadata.TotalRecords}";

        // Column headers
        var headerRow = 6;
        worksheet.Cell(headerRow, 1).Value = "Code";
        worksheet.Cell(headerRow, 2).Value = "Name";
        worksheet.Cell(headerRow, 3).Value = "Email";
        worksheet.Cell(headerRow, 4).Value = "Phone";
        worksheet.Cell(headerRow, 5).Value = "Department";
        worksheet.Cell(headerRow, 6).Value = "Position";
        worksheet.Cell(headerRow, 7).Value = "Hire Date";
        worksheet.Cell(headerRow, 8).Value = "Employment Type";
        worksheet.Cell(headerRow, 9).Value = "Status";
        worksheet.Cell(headerRow, 10).Value = "Base Salary";

        worksheet.Range(headerRow, 1, headerRow, 10).Style.Font.Bold = true;
        worksheet.Range(headerRow, 1, headerRow, 10).Style.Fill.BackgroundColor = XLColor.LightGray;

        // Data
        var row = headerRow + 1;
        foreach (var item in data)
        {
            worksheet.Cell(row, 1).Value = item.EmployeeCode;
            worksheet.Cell(row, 2).Value = item.FullName;
            worksheet.Cell(row, 3).Value = item.Email;
            worksheet.Cell(row, 4).Value = item.PhoneNumber;
            worksheet.Cell(row, 5).Value = item.Department;
            worksheet.Cell(row, 6).Value = item.Position;
            worksheet.Cell(row, 7).Value = item.HireDate.ToString("yyyy-MM-dd");
            worksheet.Cell(row, 8).Value = item.EmploymentType;
            worksheet.Cell(row, 9).Value = item.Status;
            worksheet.Cell(row, 10).Value = item.BaseSalary;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private byte[] GenerateAttendanceExcel(List<AttendanceReportData> data, ReportMetadata metadata)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Attendance Report");

        // Header
        worksheet.Cell(1, 1).Value = metadata.ReportType;
        worksheet.Cell(1, 1).Style.Font.FontSize = 16;
        worksheet.Cell(1, 1).Style.Font.Bold = true;

        worksheet.Cell(2, 1).Value = $"Generated: {metadata.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC";
        worksheet.Cell(3, 1).Value = $"Period: {metadata.StartDate:yyyy-MM-dd} to {metadata.EndDate:yyyy-MM-dd}";
        worksheet.Cell(4, 1).Value = $"Total Records: {metadata.TotalRecords}";

        // Column headers
        var headerRow = 6;
        worksheet.Cell(headerRow, 1).Value = "Code";
        worksheet.Cell(headerRow, 2).Value = "Name";
        worksheet.Cell(headerRow, 3).Value = "Department";
        worksheet.Cell(headerRow, 4).Value = "Date";
        worksheet.Cell(headerRow, 5).Value = "Clock In";
        worksheet.Cell(headerRow, 6).Value = "Clock Out";
        worksheet.Cell(headerRow, 7).Value = "Work Hours";
        worksheet.Cell(headerRow, 8).Value = "Status";
        worksheet.Cell(headerRow, 9).Value = "Notes";

        worksheet.Range(headerRow, 1, headerRow, 9).Style.Font.Bold = true;
        worksheet.Range(headerRow, 1, headerRow, 9).Style.Fill.BackgroundColor = XLColor.LightGray;

        // Data
        var row = headerRow + 1;
        foreach (var item in data)
        {
            worksheet.Cell(row, 1).Value = item.EmployeeCode;
            worksheet.Cell(row, 2).Value = item.EmployeeName;
            worksheet.Cell(row, 3).Value = item.Department;
            worksheet.Cell(row, 4).Value = item.Date.ToString("yyyy-MM-dd");
            worksheet.Cell(row, 5).Value = item.ClockIn?.ToString(@"hh\:mm") ?? "-";
            worksheet.Cell(row, 6).Value = item.ClockOut?.ToString(@"hh\:mm") ?? "-";
            worksheet.Cell(row, 7).Value = item.WorkHours;
            worksheet.Cell(row, 8).Value = item.Status;
            worksheet.Cell(row, 9).Value = item.Notes ?? "";
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private byte[] GeneratePayrollExcel(List<PayrollReportData> data, ReportMetadata metadata)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Payroll Report");

        // Header
        worksheet.Cell(1, 1).Value = metadata.ReportType;
        worksheet.Cell(1, 1).Style.Font.FontSize = 16;
        worksheet.Cell(1, 1).Style.Font.Bold = true;

        worksheet.Cell(2, 1).Value = $"Generated: {metadata.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC";
        worksheet.Cell(3, 1).Value = $"Period: {metadata.StartDate:yyyy-MM-dd} to {metadata.EndDate:yyyy-MM-dd}";
        worksheet.Cell(4, 1).Value = $"Total Records: {metadata.TotalRecords}";

        // Column headers
        var headerRow = 6;
        worksheet.Cell(headerRow, 1).Value = "Code";
        worksheet.Cell(headerRow, 2).Value = "Name";
        worksheet.Cell(headerRow, 3).Value = "Department";
        worksheet.Cell(headerRow, 4).Value = "Position";
        worksheet.Cell(headerRow, 5).Value = "Period";
        worksheet.Cell(headerRow, 6).Value = "Base Salary";
        worksheet.Cell(headerRow, 7).Value = "Allowances";
        worksheet.Cell(headerRow, 8).Value = "Deductions";
        worksheet.Cell(headerRow, 9).Value = "Net Salary";
        worksheet.Cell(headerRow, 10).Value = "Status";

        worksheet.Range(headerRow, 1, headerRow, 10).Style.Font.Bold = true;
        worksheet.Range(headerRow, 1, headerRow, 10).Style.Fill.BackgroundColor = XLColor.LightGray;

        // Data
        var row = headerRow + 1;
        foreach (var item in data)
        {
            worksheet.Cell(row, 1).Value = item.EmployeeCode;
            worksheet.Cell(row, 2).Value = item.EmployeeName;
            worksheet.Cell(row, 3).Value = item.Department;
            worksheet.Cell(row, 4).Value = item.Position;
            worksheet.Cell(row, 5).Value = item.PayrollPeriod;
            worksheet.Cell(row, 6).Value = item.BaseSalary;
            worksheet.Cell(row, 7).Value = item.Allowances;
            worksheet.Cell(row, 8).Value = item.Deductions;
            worksheet.Cell(row, 9).Value = item.NetSalary;
            worksheet.Cell(row, 10).Value = item.Status;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private byte[] GenerateLeaveExcel(List<LeaveReportData> data, ReportMetadata metadata)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Leave Report");

        // Header
        worksheet.Cell(1, 1).Value = metadata.ReportType;
        worksheet.Cell(1, 1).Style.Font.FontSize = 16;
        worksheet.Cell(1, 1).Style.Font.Bold = true;

        worksheet.Cell(2, 1).Value = $"Generated: {metadata.GeneratedAt:yyyy-MM-dd HH:mm:ss} UTC";
        worksheet.Cell(3, 1).Value = $"Total Records: {metadata.TotalRecords}";

        // Column headers
        var headerRow = 6;
        worksheet.Cell(headerRow, 1).Value = "Code";
        worksheet.Cell(headerRow, 2).Value = "Name";
        worksheet.Cell(headerRow, 3).Value = "Department";
        worksheet.Cell(headerRow, 4).Value = "Leave Type";
        worksheet.Cell(headerRow, 5).Value = "Start Date";
        worksheet.Cell(headerRow, 6).Value = "End Date";
        worksheet.Cell(headerRow, 7).Value = "Days Count";
        worksheet.Cell(headerRow, 8).Value = "Status";
        worksheet.Cell(headerRow, 9).Value = "Approved By";
        worksheet.Cell(headerRow, 10).Value = "Approved At";
        worksheet.Cell(headerRow, 11).Value = "Reason";

        worksheet.Range(headerRow, 1, headerRow, 11).Style.Font.Bold = true;
        worksheet.Range(headerRow, 1, headerRow, 11).Style.Fill.BackgroundColor = XLColor.LightGray;

        // Data
        var row = headerRow + 1;
        foreach (var item in data)
        {
            worksheet.Cell(row, 1).Value = item.EmployeeCode;
            worksheet.Cell(row, 2).Value = item.EmployeeName;
            worksheet.Cell(row, 3).Value = item.Department;
            worksheet.Cell(row, 4).Value = item.LeaveType;
            worksheet.Cell(row, 5).Value = item.StartDate.ToString("yyyy-MM-dd");
            worksheet.Cell(row, 6).Value = item.EndDate.ToString("yyyy-MM-dd");
            worksheet.Cell(row, 7).Value = item.DaysCount;
            worksheet.Cell(row, 8).Value = item.Status;
            worksheet.Cell(row, 9).Value = item.ApprovedBy ?? "-";
            worksheet.Cell(row, 10).Value = item.ApprovedAt?.ToString("yyyy-MM-dd") ?? "-";
            worksheet.Cell(row, 11).Value = item.Reason;
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    #endregion

    private string BuildFilterCriteria(ReportRequest request)
    {
        var filters = new List<string>();

        if (!string.IsNullOrEmpty(request.Department))
            filters.Add($"Department: {request.Department}");

        if (!string.IsNullOrEmpty(request.Status))
            filters.Add($"Status: {request.Status}");

        if (request.StartDate.HasValue && request.EndDate.HasValue)
            filters.Add($"Period: {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}");

        return filters.Count > 0 ? string.Join(", ", filters) : "None";
    }
}
