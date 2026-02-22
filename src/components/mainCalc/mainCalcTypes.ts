export type EarlyRepaymentType = {
    id: number;
    type: 'principal' | 'interest';
    amount: number;
    date: string;
}

export type RateChangeType = {
    id: number;
    rate: number;
    date: string;
}

export type AnnuityType = {
    id: number;
    start: string;
    end: string;
    value: number;
    months: number;
}

export type CalculationPeriodType = {
    startDate: Date;
    endDate: Date;
    month: number;
    year: number;
    debt: number;
    rate: number;
    days: number;
    interestAccruedInPeriod: number;
    penaltyAccruedInPeriod: number;
    daysInYear: number;
    repPrincipal: number;
    repInterest: number;
    isRateChanged: boolean;
    runningTotalInterestAccrued: number;
    runningTotalPenalty: number;
    totalPaidInterestAtThisPoint: number;
    payments: PaymentEventType[];
    isGlobalPenalty: boolean;
    globalPenaltyRate: number;
}

export type TotalsType = {
    days: number;
    interest: number;
    principal: number;
    penalty: number;
    overall: number;
}

export type PenaltyType = {
    id: number;
    start: string;
    end: string;
    rate: number;
}

export type PaymentEventType = {
    date: Date;
    type: 'principal' | 'interest';
    amount: number;
}
