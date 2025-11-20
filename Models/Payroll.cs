using Postgrest.Attributes;
using Postgrest.Models;

namespace EmployeeMvp.Models;

[Table("payroll")]
public class Payroll : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("employee_id")]
    public string EmployeeId { get; set; } = string.Empty;
    
    [Column("month")]
    public int Month { get; set; }
    
    [Column("year")]
    public int Year { get; set; }
    
    [Column("basic_salary")]
    public decimal BasicSalary { get; set; }
    
    [Column("allowances")]
    public decimal Allowances { get; set; }
    
    [Column("bonuses")]
    public decimal Bonuses { get; set; }
    
    [Column("deductions")]
    public decimal Deductions { get; set; }
    
    [Column("tax")]
    public decimal Tax { get; set; }
    
    [Column("net_salary")]
    public decimal NetSalary { get; set; }
    
    [Column("payment_date")]
    public DateTime? PaymentDate { get; set; }
    
    [Column("payment_status")]
    public string PaymentStatus { get; set; } = string.Empty;
    
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }
    
    [Column("notes")]
    public string? Notes { get; set; }
    
    [Column("processed_by")]
    public string? ProcessedBy { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public Employee? Employee { get; set; }
}
