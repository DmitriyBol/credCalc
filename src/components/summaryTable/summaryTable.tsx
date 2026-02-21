import { formatDate, formatMoney } from 'utils/dateChecks';
import styles from './summaryTable.module.css';
import {CalculationPeriodType, TotalsType } from 'components/mainCalc/mainCalcTypes';

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
                        <th className={`${styles.td} ${styles.penalty}`}>Пени</th>
                        <th className={`${styles.th} ${styles.annuityTh}`}>Аннуитет</th>
                    </tr>
                    </thead>
                    <tbody>
                    {calculations.map((period, index) => {
                        let paidInterestUntilNow = 0;
                        for (let i = 0; i <= index; i++) paidInterestUntilNow += calculations[i].repInterest;

                        const totalDebtHere = period.debt + period.runningTotalInterestAccrued + period.runningTotalPenalty - paidInterestUntilNow;
                        const annuityVal = getAnnuityValue(period.endDate);

                        return (
                            <tr key={index} className={styles.tr}>
                                <td className={styles.td}>{formatDate(period.endDate)}</td>
                                <td className={styles.td}>{period.days}</td>
                                <td className={styles.td}>{period.rate}%</td>
                                <td className={styles.td}>{formatMoney(period.interestAccruedInPeriod)}</td>
                                <td className={styles.td}>{formatMoney(period.debt)}</td>
                                <td className={`${styles.td} ${styles.tdHighlight}`}>{formatMoney(totalDebtHere)}</td>
                                <td className={`${styles.td} ${styles.penalty}`}>{formatMoney(period.penaltyAccruedInPeriod)}</td>
                                <td className={`${styles.td} ${styles.annuityTd}`}>{annuityVal ? formatMoney(annuityVal) : '—'}</td>
                            </tr>
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