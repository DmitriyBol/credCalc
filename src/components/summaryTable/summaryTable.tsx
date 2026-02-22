import React from 'react';
import { formatDate, formatMoney } from 'utils/dateChecks';
import styles from './summaryTable.module.css';
import { CalculationPeriodType, TotalsType } from 'components/mainCalc/mainCalcTypes';

type PropsType = {
    calculations: CalculationPeriodType[];
    getAnnuityValue: (dateObj: Date) => number | null;
    totals: TotalsType;
}

export const SummaryTable = ({ calculations, getAnnuityValue, totals }: PropsType) => {
    return (
        <div className={styles.tableSection}>
            <h3 className={styles.tableTitle}>Сводная таблица платежей</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th className={styles.th}>Дата платежа</th>
                        <th className={styles.th}>Период (дн.)</th>
                        <th className={styles.th}>Ставка</th>
                        <th className={styles.th}>Начислено %</th>
                        <th className={styles.th}>Осн. долг</th>
                        <th className={styles.th}>Задолженность все</th>
                        <th className={`${styles.th} ${styles.penalty}`}>Пени</th>
                        <th className={`${styles.th} ${styles.annuityTh}`}>Аннуитет</th>
                    </tr>
                    </thead>
                    <tbody>
                    {calculations.map((period, index) => {
                        let paidInterestUntilNow = 0;
                        for (let i = 0; i <= index; i++) paidInterestUntilNow += calculations[i].repInterest;

                        const totalDebtHere = period.debt + period.runningTotalInterestAccrued - paidInterestUntilNow;
                        const annuityVal = getAnnuityValue(period.endDate);

                        return (
                            <React.Fragment key={index}>
                                {period.isRateChanged && (
                                    <tr className={`${styles.tr} ${styles.trRateChange}`}>
                                        <td className={styles.td}>{formatDate(period.startDate)}</td>
                                        <td className={`${styles.td} ${styles.tdRateChangeLabel}`} colSpan={1}>Новая ставка:</td>
                                        <td className={`${styles.td} ${styles.tdRateChangeValue}`}>{period.rate}%</td>
                                        <td className={styles.td} colSpan={5}></td>
                                    </tr>
                                )}

                                {period.payments?.map((payment, pIdx) => (
                                    <tr key={`payment-${index}-${pIdx}`} className={`${styles.tr} ${styles.trPayment}`}>
                                        <td className={styles.td}>{formatDate(payment.date)}</td>

                                        <td className={`${styles.td} ${styles.tdPaymentLabel}`} colSpan={payment.type === 'principal' ? 3 : 2}>
                                            Погашение ({payment.type === 'principal' ? 'осн. долг' : '%'}):
                                        </td>
                                        <td className={`${styles.td} ${styles.tdPaymentValue}`}>
                                            -{formatMoney(payment.amount)}
                                        </td>
                                        <td className={styles.td} colSpan={payment.type === 'principal' ? 3 : 4}></td>
                                    </tr>
                                ))}

                                <tr className={styles.tr}>
                                    <td className={styles.td}>{formatDate(period.endDate)}</td>
                                    <td className={styles.td}>{period.days}</td>
                                    <td className={styles.td}>{period.rate}%</td>
                                    <td className={styles.td}>{formatMoney(period.interestAccruedInPeriod)}</td>
                                    <td className={styles.td}>{formatMoney(period.debt)}</td>
                                    <td className={`${styles.td} ${styles.tdHighlight}`}>{formatMoney(totalDebtHere)}</td>
                                    <td className={`${styles.td} ${styles.penalty}`}>{formatMoney(period.penaltyAccruedInPeriod)}</td>
                                    <td className={`${styles.td} ${styles.annuityTd}`}>{annuityVal ? formatMoney(annuityVal) : '—'}</td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                    <tfoot className={styles.tfoot}>
                    <tr>
                        <td className={styles.td}>Итого</td>
                        <td className={styles.td}>{totals.days}</td>
                        <td className={styles.td}>—</td>
                        <td className={styles.td}>{formatMoney(totals.interest)}</td>
                        <td className={styles.td}>{formatMoney(totals.principal)}</td>
                        <td className={`${styles.td} ${styles.tdHighlight}`}>{formatMoney(totals.overall)}</td>
                        <td className={`${styles.td} ${styles.penalty}`}>{formatMoney(totals.penalty)}</td>
                        <td className={`${styles.td} ${styles.annuityTfoot}`}></td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};