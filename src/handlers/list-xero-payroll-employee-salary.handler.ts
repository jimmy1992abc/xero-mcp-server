import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { PayTemplate } from "xero-node/dist/gen/model/payroll-au/payTemplate.js";

/**
 * Internal function to fetch employee pay template from Xero AU Payroll
 */
async function fetchEmployeePayTemplate(employeeId: string): Promise<PayTemplate | undefined> {
  await xeroClient.authenticate();

  const response = await xeroClient.payrollAUApi.getEmployee(
    xeroClient.tenantId,
    employeeId,
    getClientHeaders(),
  );

  const employee = response.body.employees?.[0];
  return employee?.payTemplate;
}

/**
 * Get employee salary and pay template from Xero AU Payroll
 */
export async function listXeroPayrollEmployeeSalary(
  employeeId: string,
): Promise<XeroClientResponse<PayTemplate | null>> {
  try {
    const payTemplate = await fetchEmployeePayTemplate(employeeId);

    if (!payTemplate) {
      return {
        result: null,
        isError: false,
        error: null,
      };
    }

    return {
      result: payTemplate,
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
