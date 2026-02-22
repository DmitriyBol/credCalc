import { useState, useMemo } from 'react';
import { RepaymentSection } from 'components/repaymentSection/repaymentSection';
import { AnnuitySection } from 'components/annuitySection/annuitySection';
import { SummaryTable } from 'components/summaryTable/summaryTable';
import { DetailedCards } from 'components/detailedCards/detailedCards';
import { RateChangeSection } from 'components/rateChangeSection/rateChangeSection';
import { PenaltySection } from 'components/penaltySection/penaltySection';
import { isLeapYear } from 'utils/dateChecks';
import { AnnuityType, CalculationPeriodType, EarlyRepaymentType, RateChangeType, TotalsType, PenaltyType } from "./mainCalcTypes";
import { ProjectDataPayloadType, ProjectSave } from "components/projectSave/projectSave";

import styles from './mainCalc.module.css';

const MainCalc = () => {
    const [amount, setAmount] = useState<number>(1_000_000);
    const [startDate, setStartDate] = useState<string>('2026-02-02');
    const [endDate, setEndDate] = useState<string>('2026-06-30');
    const [baseRate, setBaseRate] = useState<number>(20);

    const [earlyRepayments, setEarlyRepayments] = useState<EarlyRepaymentType[]>([]);
    const [rateChanges, setRateChanges] = useState<RateChangeType[]>([]);
    const [annuities, setAnnuities] = useState<AnnuityType[]>([]);
    const [penalties, setPenalties] = useState<PenaltyType[]>([]);

    // Стейты для управления режимом пени
    const [isGlobalPenalty, setIsGlobalPenalty] = useState<boolean>(true);
    const [globalPenaltyRate, setGlobalPenaltyRate] = useState<number>(20);

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

    const handleLoadProject = (pd: ProjectDataPayloadType) => {
        setAmount(pd.amount);
        setBaseRate(pd.baseRate);
        setStartDate(pd.startDate);
        setEndDate(pd.endDate);
        setEarlyRepayments(pd.earlyRepayments || []);
        setRateChanges(pd.rateChanges || []);
        setAnnuities(pd.annuities || []);
        setPenalties(pd.penalties || []);

        if (pd.isGlobalPenalty !== undefined) setIsGlobalPenalty(pd.isGlobalPenalty);
        if (pd.globalPenaltyRate !== undefined) setGlobalPenaltyRate(pd.globalPenaltyRate);
    };

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const calculations = useMemo(() => {
        if (!startDate || !endDate || amount <= 0) return [];
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(0, 0, 0, 0);
        if (end < start) return [];

        const sortedRates = [...rateChanges].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentRate = Number(baseRate);
        sortedRates.forEach(r => { if (new Date(r.date) <= start) currentRate = r.rate; });

        const periods: CalculationPeriodType[] = [];
        let currentPeriod: Omit<CalculationPeriodType, 'runningTotalInterestAccrued' | 'runningTotalPenalty' | 'totalPaidInterestAtThisPoint'> | null = null;

        let currentDebt = Number(amount);
        let totalPaidInterest = 0;

        let historicalDueInterest = 0;
        let monthAccruedInterest = 0;

        const d = new Date(start);
        while (d <= end) {
            const time = d.getTime();
            const daysInYear = isLeapYear(d.getFullYear()) ? 366 : 365;

            // 1. СНАЧАЛА проверяем и применяем платежи ИМЕННО в этот день (возвращено как было)
            const todaysPayments = earlyRepayments.filter(r => new Date(r.date).setHours(0, 0, 0, 0) === time);
            let dailyRepPrincipal = 0;
            let dailyRepInterest = 0;

            todaysPayments.forEach(p => {
                if (p.type === 'principal') dailyRepPrincipal += p.amount;
                if (p.type === 'interest') dailyRepInterest += p.amount;
            });

            if (dailyRepPrincipal > 0 || dailyRepInterest > 0) {
                currentDebt = Math.max(0, currentDebt - dailyRepPrincipal);
                totalPaidInterest += dailyRepInterest;
            }

            let rateChanged = false;
            const foundRate = sortedRates.find(r => new Date(r.date).setHours(0,0,0,0) === time);
            if (foundRate) { currentRate = foundRate.rate; rateChanged = true; }

            // 2. ЗАТЕМ Расчет Пени (база: выставленные_проценты - оплаченные_проценты)
            const overdueInterestForPenalty = Math.max(0, historicalDueInterest - totalPaidInterest);
            let dailyPenalty = 0;
            let activePenaltyRate: number | null = null;

            if (isGlobalPenalty) {
                activePenaltyRate = globalPenaltyRate;
            } else {
                const activeCustomPenalty = penalties.find(p => {
                    const pStart = new Date(p.start).setHours(0,0,0,0);
                    const pEnd = new Date(p.end).setHours(0,0,0,0);
                    return time >= pStart && time <= pEnd;
                });
                if (activeCustomPenalty) activePenaltyRate = activeCustomPenalty.rate;
            }

            if (activePenaltyRate !== null && overdueInterestForPenalty > 0) {
                dailyPenalty = overdueInterestForPenalty * (activePenaltyRate / 100) / daysInYear;
            }

            // 3. Начисляем основные проценты за текущий день
            const dailyInterest = (currentDebt * (currentRate / 100)) / daysInYear;
            monthAccruedInterest += dailyInterest;

            // Формируем периоды
            if (!currentPeriod || currentPeriod.month !== d.getMonth() || currentPeriod.rate !== currentRate || todaysPayments.length > 0 || rateChanged) {
                if (currentPeriod) periods.push(currentPeriod as CalculationPeriodType);
                currentPeriod = {
                    startDate: new Date(d), endDate: new Date(d), month: d.getMonth(), year: d.getFullYear(),
                    debt: currentDebt, rate: currentRate, days: 0, interestAccruedInPeriod: 0, penaltyAccruedInPeriod: 0, daysInYear,
                    repPrincipal: 0, repInterest: 0, isRateChanged: rateChanged,
                    payments: []
                };
            } else {
                currentPeriod.endDate = new Date(d);
            }

            // Записываем операции в период
            if (todaysPayments.length > 0) {
                currentPeriod.payments.push(...todaysPayments.map(p => ({
                    date: new Date(p.date),
                    type: p.type,
                    amount: p.amount
                })));
                currentPeriod.repPrincipal += dailyRepPrincipal;
                currentPeriod.repInterest += dailyRepInterest;
            }

            currentPeriod.days += 1;
            currentPeriod.interestAccruedInPeriod += dailyInterest;
            currentPeriod.penaltyAccruedInPeriod += dailyPenalty;

            // 4. Фиксация начисленных % в конце месяца
            const tomorrow = new Date(d);
            tomorrow.setDate(tomorrow.getDate() + 1);
            if (tomorrow.getMonth() !== d.getMonth() || time === end.getTime()) {
                historicalDueInterest += monthAccruedInterest;
                monthAccruedInterest = 0;
            }

            d.setDate(d.getDate() + 1);
        }
        if (currentPeriod) periods.push(currentPeriod as CalculationPeriodType);

        let runningTotalInterestAccrued = 0;
        let runningTotalPenalty = 0;

        return periods.map(p => {
            runningTotalInterestAccrued += p.interestAccruedInPeriod;
            runningTotalPenalty += p.penaltyAccruedInPeriod;
            return { ...p, runningTotalInterestAccrued, runningTotalPenalty, totalPaidInterestAtThisPoint: totalPaidInterest };
        });
    }, [amount, startDate, endDate, baseRate, earlyRepayments, rateChanges, annuities, penalties, isGlobalPenalty, globalPenaltyRate]);

    const totals: TotalsType = {
        days: calculations.reduce((sum, p) => sum + p.days, 0),
        interest: calculations.length ? calculations[calculations.length - 1].runningTotalInterestAccrued : 0,
        principal: calculations.length ? calculations[calculations.length - 1].debt : Number(amount),
        penalty: calculations.length ? calculations[calculations.length - 1].runningTotalPenalty : 0,
        overall: 0
    };
    totals.overall = totals.principal + totals.interest - calculations.reduce((sum, p) => sum + p.repInterest, 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Кредитный калькулятор</h2>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}><label className={styles.label}>Сумма займа (₽)</label><input placeholder="0" type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className={styles.input}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Ставка (% годовых)</label><input type="number" step="0.1" value={baseRate} onChange={(e) => setBaseRate(Number(e.target.value))} className={styles.input}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Дата начала</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.input}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Дата окончания</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.input}/></div>

                <div className={styles.sectionDivider}><h3 className={styles.subtitle}>Дополнительные условия</h3></div>

                <RepaymentSection repayments={earlyRepayments} onAdd={addItem(setEarlyRepayments)} onRemove={removeItem(setEarlyRepayments)}/>
                <AnnuitySection annuities={annuities} onAdd={addItem(setAnnuities)} onRemove={removeItem(setAnnuities)} baseRate={baseRate} amount={amount}/>
                <RateChangeSection rateChanges={rateChanges} onAdd={addItem(setRateChanges)} onRemove={removeItem(setRateChanges)}/>

                <PenaltySection
                    penalties={penalties}
                    onAdd={addItem(setPenalties)}
                    onRemove={removeItem(setPenalties)}
                    isGlobal={isGlobalPenalty}
                    setIsGlobal={setIsGlobalPenalty}
                    globalRate={globalPenaltyRate}
                    setGlobalRate={setGlobalPenaltyRate}
                />

                <ProjectSave
                    currentData={{ amount, baseRate, startDate, endDate, earlyRepayments, rateChanges, annuities, penalties, isGlobalPenalty, globalPenaltyRate }}
                    onLoadProject={handleLoadProject}
                />
            </div>

            {calculations.length > 0 && (
                <>
                    <SummaryTable calculations={calculations} getAnnuityValue={getAnnuityValueForDate} totals={totals}/>
                    <DetailedCards calculations={calculations} getAnnuityValue={getAnnuityValueForDate}/>
                </>
            )}
        </div>
    );
};

export default MainCalc;