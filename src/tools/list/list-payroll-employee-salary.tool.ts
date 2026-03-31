import { EarningsLine } from "xero-node/dist/gen/model/payroll-au/earningsLine.js";
import { DeductionLine } from "xero-node/dist/gen/model/payroll-au/deductionLine.js";
import { SuperLine } from "xero-node/dist/gen/model/payroll-au/superLine.js";
import { listXeroPayrollEmployeeSalary } from "../../handlers/list-xero-payroll-employee-salary.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";
import { z } from "zod";

const ListPayrollEmployeeSalaryTool = CreateXeroTool(
  "list-payroll-employee-salary",
  `List salary and pay template for a specific payroll employee in Xero.
This retrieves the employee's pay template including earnings lines (annual salary, rate per unit,
number of units per week), deduction lines, superannuation lines, and reimbursement lines.
You must provide the employee ID. Use the list-payroll-employees tool first to find the employee ID.`,
  {
    employeeId: z.string().describe("The Xero employee ID to retrieve salary and pay template for"),
  },
  async (args: { employeeId: string }) => {
    const response = await listXeroPayrollEmployeeSalary(args.employeeId);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing employee salary: ${response.error}`,
          },
        ],
      };
    }

    const payTemplate = response.result;

    if (!payTemplate) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No pay template found for this employee.",
          },
        ],
      };
    }

    const sections: string[] = [];

    // Earnings lines
    if (payTemplate.earningsLines && payTemplate.earningsLines.length > 0) {
      sections.push("## Earnings");
      payTemplate.earningsLines.forEach((line: EarningsLine, index: number) => {
        sections.push(
          [
            `Earnings Line ${index + 1}:`,
            `  Earnings Rate ID: ${line.earningsRateID}`,
            line.calculationType ? `  Calculation Type: ${line.calculationType}` : null,
            line.annualSalary != null ? `  Annual Salary: $${line.annualSalary.toLocaleString()}` : null,
            line.ratePerUnit != null ? `  Rate Per Unit: $${line.ratePerUnit}` : null,
            line.numberOfUnitsPerWeek != null ? `  Units Per Week: ${line.numberOfUnitsPerWeek}` : null,
            line.normalNumberOfUnits != null ? `  Normal Number of Units: ${line.normalNumberOfUnits}` : null,
            line.amount != null ? `  Amount: $${line.amount}` : null,
            line.fixedAmount != null ? `  Fixed Amount: $${line.fixedAmount}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      });
    }

    // Deduction lines
    if (payTemplate.deductionLines && payTemplate.deductionLines.length > 0) {
      sections.push("## Deductions");
      payTemplate.deductionLines.forEach((line: DeductionLine, index: number) => {
        sections.push(
          [
            `Deduction Line ${index + 1}:`,
            `  Deduction Type ID: ${line.deductionTypeID}`,
            line.calculationType ? `  Calculation Type: ${line.calculationType}` : null,
            line.percentage != null ? `  Percentage: ${line.percentage}%` : null,
            line.amount != null ? `  Amount: $${line.amount}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      });
    }

    // Super lines
    if (payTemplate.superLines && payTemplate.superLines.length > 0) {
      sections.push("## Superannuation");
      payTemplate.superLines.forEach((line: SuperLine, index: number) => {
        sections.push(
          [
            `Super Line ${index + 1}:`,
            line.superMembershipID ? `  Super Membership ID: ${line.superMembershipID}` : null,
            line.contributionType ? `  Contribution Type: ${line.contributionType}` : null,
            line.calculationType ? `  Calculation Type: ${line.calculationType}` : null,
            line.percentage != null ? `  Percentage: ${line.percentage}%` : null,
            line.amount != null ? `  Amount: $${line.amount}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      });
    }

    // Reimbursement lines
    if (payTemplate.reimbursementLines && payTemplate.reimbursementLines.length > 0) {
      sections.push("## Reimbursements");
      sections.push(`${payTemplate.reimbursementLines.length} reimbursement line(s)`);
    }

    // Leave lines
    if (payTemplate.leaveLines && payTemplate.leaveLines.length > 0) {
      sections.push("## Leave");
      sections.push(`${payTemplate.leaveLines.length} leave line(s)`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: sections.length > 0
            ? `Pay Template:\n\n${sections.join("\n\n")}`
            : "Pay template exists but has no lines.",
        },
      ],
    };
  },
);

export default ListPayrollEmployeeSalaryTool;
