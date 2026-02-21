import { useState, useMemo } from 'react';
import { RepaymentSection } from 'components/repaymentSection/repaymentSection';
import { AnnuitySection } from 'components/annuitySection/annuitySection';
import { SummaryTable } from 'components/summaryTable/summaryTable';
import { DetailedCards } from 'components/detailedCards/detailedCards';
import { RateChangeSection } from 'components/rateChangeSection/rateChangeSection';

import styles from './mainCalc.module.css';
import { isLeapYear } from 'utils/dateChecks';
import {AnnuityType, CalculationPeriodType, EarlyRepaymentType, RateChangeType, TotalsType} from "./mainCalcTypes";

const MainCalc = () => {
    const [amount, setAmount] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>('2025-02-01');
    const [endDate, setEndDate] = useState<string>('2025-07-01');
    const [baseRate, setBaseRate] = useState<number>(20);

    const [earlyRepayments, setEarlyRepayments] = useState<EarlyRepaymentType[]>([]);
    const [rateChanges, setRateChanges] = useState<RateChangeType[]>([]);
    const [annuities, setAnnuities] = useState<AnnuityType[]>([]);

    const addItem = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (item: Omit<T, 'id'>) => {
        setter((prev) => [...prev, { ...item, id: Date.now() } as T]);
    };

    const removeItem = <T extends { id: number }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: number) => {
        setter((prev) => prev.filter((i) => i.id !== id));
    };

    const getAnnuityValueForDate = (dateObj: Date): number | null => {
        const dTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
        const found = annuities.find((a) => {
            const s = new Date(a.start);
            const sTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
            const e = new Date(a.end);
            const eTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
            return dTime >= sTime && dTime <= eTime;
        });
        return found ? found.value : null;
    };

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const calculations = useMemo(() => {
        if (!startDate || !endDate || amount <= 0) return [];
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(0, 0, 0, 0);
        if (end < start) return [];

        const repMap: Record<number, { principal: number; interest: number }> = {};
        earlyRepayments.forEach(r => {
            const t = new Date(r.date).setHours(0, 0, 0, 0);
            if (!repMap[t]) repMap[t] = { principal: 0, interest: 0 };
            repMap[t][r.type] += r.amount;
        });

        const sortedRates = [...rateChanges].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentRate = Number(baseRate);
        sortedRates.forEach(r => { if (new Date(r.date) <= start) currentRate = r.rate; });

        const periods: CalculationPeriodType[] = [];
        let currentPeriod: Omit<CalculationPeriodType, 'runningTotalInterestAccrued' | 'runningTotalPenalty' | 'totalPaidInterestAtThisPoint'> | null = null;
        let currentDebt = Number(amount);
        let runningTotalInterestAccrued = 0;
        let runningTotalPenalty = 0;
        let totalPaidInterest = 0;
        let overdueAmount = 0;

        const d = new Date(start);
        while (d <= end) {
            const time = d.getTime();
            let dailyRepPrincipal = 0;
            let dailyRepInterest = 0;
            let rateChanged = false;

            if (repMap[time]) {
                dailyRepPrincipal = repMap[time].principal;
                dailyRepInterest = repMap[time].interest;
                currentDebt = Math.max(0, currentDebt - dailyRepPrincipal);
                totalPaidInterest += dailyRepInterest;

                // При любом платеже сбрасываем просрочку (упрощенная модель погашения)
                if (dailyRepPrincipal > 0 || dailyRepInterest > 0) {
                    overdueAmount = 0;
                }
            }

            const foundRate = sortedRates.find(r => new Date(r.date).setHours(0,0,0,0) === time);
            if (foundRate) { currentRate = foundRate.rate; rateChanged = true; }

            const daysInYear = isLeapYear(d.getFullYear()) ? 366 : 365;
            const dailyPenalty = overdueAmount * 0.001; // Формула из РФ: 0.1% в день от суммы просрочки

            if (!currentPeriod || currentPeriod.month !== d.getMonth() || currentPeriod.rate !== currentRate || dailyRepPrincipal > 0 || dailyRepInterest > 0) {
                if (currentPeriod) periods.push(currentPeriod as CalculationPeriodType);
                currentPeriod = {
                    startDate: new Date(d), endDate: new Date(d), month: d.getMonth(), year: d.getFullYear(),
                    debt: currentDebt, rate: currentRate, days: 0, interestAccruedInPeriod: 0, penaltyAccruedInPeriod: 0, daysInYear,
                    repPrincipal: dailyRepPrincipal, repInterest: dailyRepInterest, isRateChanged: rateChanged
                };
            } else {
                currentPeriod.endDate = new Date(d);
            }

            currentPeriod.days += 1;
            currentPeriod.interestAccruedInPeriod += (currentDebt * (currentRate / 100)) / daysInYear;
            currentPeriod.penaltyAccruedInPeriod += dailyPenalty;

            // Проверяем дату начисления % (конец месяца или конец займа)
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);
            const isInterestAccrualDate = d.getMonth() !== nextDay.getMonth() || d.getTime() === end.getTime();

            // Начисляем просрочку, если в день начисления не было выплат
            if (isInterestAccrualDate && dailyRepPrincipal === 0 && dailyRepInterest === 0) {
                const annuityVal = getAnnuityValueForDate(d);
                if (annuityVal) {
                    overdueAmount += annuityVal; // Для аннуитета просрочен весь платеж
                } else {
                    overdueAmount += currentPeriod.interestAccruedInPeriod; // Для обычного — просрочены проценты
                }
            }

            d.setDate(d.getDate() + 1);
        }
        if (currentPeriod) periods.push(currentPeriod as CalculationPeriodType);

        return periods.map(p => {
            runningTotalInterestAccrued += p.interestAccruedInPeriod;
            runningTotalPenalty += p.penaltyAccruedInPeriod;
            return { ...p, runningTotalInterestAccrued, runningTotalPenalty, totalPaidInterestAtThisPoint: totalPaidInterest };
        });
    }, [amount, startDate, endDate, baseRate, earlyRepayments, rateChanges, annuities]);

    const totals: TotalsType = {
        days: calculations.reduce((sum, p) => sum + p.days, 0),
        interest: calculations.length ? calculations[calculations.length - 1].runningTotalInterestAccrued : 0,
        principal: calculations.length ? calculations[calculations.length - 1].debt : Number(amount),
        penalty: calculations.length ? calculations[calculations.length - 1].runningTotalPenalty : 0,
        overall: 0
    };
    totals.overall = totals.principal + totals.interest + totals.penalty - calculations.reduce((sum, p) => sum + p.repInterest, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Кредитный калькулятор</h2>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Сумма займа (₽)</label>
                    <input placeholder="0" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Ставка (% годовых)</label>
                    <input type="number" step="0.1" value={baseRate} onChange={(e) => setBaseRate(Number(e.target.value))} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Дата начала</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Дата окончания</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.input} />
                </div>

                <div className={styles.sectionDivider}><h3 className={styles.subtitle}>Дополнительные условия</h3></div>

                <RepaymentSection repayments={earlyRepayments} onAdd={addItem(setEarlyRepayments)} onRemove={removeItem(setEarlyRepayments)} />
                <AnnuitySection annuities={annuities} onAdd={addItem(setAnnuities)} onRemove={removeItem(setAnnuities)} baseRate={baseRate} amount={amount} />
                <RateChangeSection rateChanges={rateChanges} onAdd={addItem(setRateChanges)} onRemove={removeItem(setRateChanges)} />
            </div>

            {calculations.length > 0 && (
                <>
                    <SummaryTable calculations={calculations} getAnnuityValue={getAnnuityValueForDate} totals={totals} />
                    <DetailedCards calculations={calculations} getAnnuityValue={getAnnuityValueForDate} />
                </>
            )}
        </div>
    );
};

export default MainCalc;