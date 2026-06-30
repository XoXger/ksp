export const MAX_LOAN_DURATION = 12;
export const MIN_LOAN_DURATION = 4;
export const MAX_LOAN_INTEREST_RATE = 1.5;
export const MIN_LOAN_INTEREST_RATE = 0.5;
export const MIN_LOAN_PRINCIPAL = 1_000_000;

export type LoanInterestType = "menurun" | "flat";

export type LoanSimulationInput = {
  duration: number;
  interestRate: number;
  interestType: LoanInterestType;
  principal: number;
};

export type LoanInstallmentRow = {
  month: number;
  openingPrincipal: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
};

export function createLoanSimulation(input: LoanSimulationInput) {
  const installmentRows = createLoanInstallmentRows(input);

  return {
    ...input,
    firstRow:
      installmentRows[0] ??
      ({
        interestPayment: 0,
        month: 1,
        openingPrincipal: 0,
        principalPayment: 0,
        totalPayment: 0,
      } satisfies LoanInstallmentRow),
    installmentRows,
  };
}

export function createLoanInstallmentRows({
  duration,
  interestRate,
  interestType,
  principal,
}: LoanSimulationInput) {
  const monthlyInterestRate = interestRate / 100;
  const regularPrincipalPayment = Math.floor(principal / duration);
  const flatTotalInterest = Math.round(
    principal * monthlyInterestRate * duration,
  );
  const regularFlatInterestPayment =
    duration > 0 ? Math.floor(flatTotalInterest / duration) : 0;

  return Array.from({ length: duration }, (_, index) => {
    const month = index + 1;
    const paidPrincipalBefore = regularPrincipalPayment * index;
    const openingPrincipal = Math.max(principal - paidPrincipalBefore, 0);
    const principalPayment =
      month === duration
        ? openingPrincipal
        : Math.min(regularPrincipalPayment, openingPrincipal);
    const interestPayment =
      interestType === "flat"
        ? month === duration
          ? flatTotalInterest - regularFlatInterestPayment * (duration - 1)
          : regularFlatInterestPayment
        : Math.round(openingPrincipal * monthlyInterestRate);

    return {
      month,
      openingPrincipal,
      principalPayment,
      interestPayment,
      totalPayment: principalPayment + interestPayment,
    };
  });
}

export function isValidLoanSimulationInput({
  duration,
  interestRate,
  principal,
}: LoanSimulationInput) {
  return (
    principal >= MIN_LOAN_PRINCIPAL &&
    duration >= MIN_LOAN_DURATION &&
    duration <= MAX_LOAN_DURATION &&
    interestRate >= MIN_LOAN_INTEREST_RATE &&
    interestRate <= MAX_LOAN_INTEREST_RATE
  );
}
