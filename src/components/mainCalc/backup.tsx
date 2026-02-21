// import {useMemo, useState} from 'react';
//
// import styles from './mainCalc.module.css';
//
// const MainCalc = () => {
//     const [amount, setAmount] = useState(0);
//     const [startDate, setStartDate] = useState('2025-02-01');
//     const [endDate, setEndDate] = useState('2025-07-01');
//     const [baseRate, setBaseRate] = useState(20);
//
//     const [earlyRepayments, setEarlyRepayments] = useState([]);
//     const [repTypeInput, setRepTypeInput] = useState('principal');
//     const [repAmountInput, setRepAmountInput] = useState('');
//     const [repDateInput, setRepDateInput] = useState('');
//
//     const [rateChanges, setRateChanges] = useState([]);
//     const [rateInput, setRateInput] = useState('');
//     const [rateDateInput, setRateDateInput] = useState('');
//
//     const [annuities, setAnnuities] = useState([]);
//     const [annuityStart, setAnnuityStart] = useState('');
//     const [annuityEnd, setAnnuityEnd] = useState('');
//
//     const [showCards, setShowCards] = useState(false);
//
//     const formatMoney = (val) =>
//         new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB'}).format(val);
//     const formatNum = (val) =>
//         new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(
//             val
//         );
//     const formatDate = (dateString) =>
//         new Date(dateString).toLocaleDateString('ru-RU', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//         });
//     const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
//
//     const handleAddRepayment = () => {
//         if (repAmountInput > 0 && repDateInput) {
//             setEarlyRepayments([
//                 ...earlyRepayments,
//                 {
//                     id: Date.now(),
//                     type: repTypeInput,
//                     amount: Number(repAmountInput),
//                     date: repDateInput,
//                 },
//             ]);
//             setRepAmountInput('');
//             setRepDateInput('');
//         }
//     };
//
//     const handleRemoveRepayment = (id) =>
//         setEarlyRepayments(earlyRepayments.filter((r) => r.id !== id));
//
//     const handleAddRateChange = () => {
//         if (rateInput >= 0 && rateDateInput) {
//             setRateChanges([
//                 ...rateChanges,
//                 {id: Date.now(), rate: Number(rateInput), date: rateDateInput},
//             ]);
//             setRateInput('');
//             setRateDateInput('');
//         }
//     };
//
//     const handleRemoveRateChange = (id) => setRateChanges(rateChanges.filter((r) => r.id !== id));
//
//     const handleAddAnnuity = () => {
//         const sDate = new Date(annuityStart);
//         const eDate = new Date(annuityEnd);
//
//         if (annuityStart && annuityEnd && eDate > sDate) {
//             const diffTime = Math.abs(eDate - sDate);
//             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//             const months = Math.round(diffDays / 30.4167) || 1;
//
//             const monthlyRate = baseRate / 100 / 12;
//
//             let value = 0;
//             if (monthlyRate === 0) {
//                 value = amount / months;
//             } else {
//                 const factor = Math.pow(1 + monthlyRate, months);
//                 value = amount * ((monthlyRate * factor) / (factor - 1));
//             }
//
//             setAnnuities([
//                 ...annuities,
//                 {
//                     id: Date.now(),
//                     start: annuityStart,
//                     end: annuityEnd,
//                     value,
//                     months,
//                 },
//             ]);
//             setAnnuityStart('');
//             setAnnuityEnd('');
//         }
//     };
//
//     const handleRemoveAnnuity = (id) => setAnnuities(annuities.filter((a) => a.id !== id));
//
//     const getAnnuityValueForDate = (dateObj) => {
//         const dTime = dateObj.getTime();
//
//         const found = annuities.find((a) => {
//             const sTime = new Date(a.start).setHours(0, 0, 0, 0);
//             const eTime = new Date(a.end).setHours(0, 0, 0, 0);
//             return dTime >= sTime && dTime <= eTime;
//         });
//
//         return found ? found.value : null;
//     };
//
//     const calculations = useMemo(() => {
//         if (!startDate || !endDate || amount <= 0) return [];
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         const end = new Date(endDate);
//         end.setHours(0, 0, 0, 0);
//         if (end < start) return [];
//
//         const repMap = {};
//         earlyRepayments.forEach((r) => {
//             const t = new Date(r.date).setHours(0, 0, 0, 0);
//             if (!repMap[t]) repMap[t] = {principal: 0, interest: 0};
//             if (r.type === 'principal') repMap[t].principal += r.amount;
//             if (r.type === 'interest') repMap[t].interest += r.amount;
//         });
//
//         const rateMap = {};
//         const sortedRates = [...rateChanges].sort((a, b) => new Date(a.date) - new Date(b.date));
//         sortedRates.forEach((r) => {
//             const t = new Date(r.date).setHours(0, 0, 0, 0);
//             rateMap[t] = r.rate;
//         });
//
//         let currentRate = Number(baseRate);
//         sortedRates.forEach((r) => {
//             if (new Date(r.date) <= start) currentRate = r.rate;
//         });
//
//         let periods = [];
//         let currentPeriod = null;
//         let currentDebt = Number(amount);
//
//         let runningTotalInterestAccrued = 0;
//         let totalPaidInterest = 0;
//
//         let d = new Date(start);
//         while (d <= end) {
//             const time = d.getTime();
//             let dailyRepPrincipal = 0;
//             let dailyRepInterest = 0;
//             let isRateChangedToday = false;
//
//             if (repMap[time]) {
//                 dailyRepPrincipal = repMap[time].principal;
//                 dailyRepInterest = repMap[time].interest;
//
//                 currentDebt = Math.max(0, currentDebt - dailyRepPrincipal);
//                 totalPaidInterest += dailyRepInterest;
//             }
//
//             if (rateMap[time] !== undefined) {
//                 currentRate = rateMap[time];
//                 isRateChangedToday = true;
//             }
//
//             const month = d.getMonth();
//             const year = d.getFullYear();
//             const daysInYear = isLeapYear(year) ? 366 : 365;
//
//             if (
//                 !currentPeriod ||
//                 currentPeriod.month !== month ||
//                 currentPeriod.rate !== currentRate ||
//                 dailyRepPrincipal > 0 ||
//                 dailyRepInterest > 0
//             ) {
//                 if (currentPeriod) periods.push(currentPeriod);
//                 currentPeriod = {
//                     startDate: new Date(d),
//                     endDate: new Date(d),
//                     month: month,
//                     year: year,
//                     debt: currentDebt,
//                     rate: currentRate,
//                     days: 0,
//                     interestAccruedInPeriod: 0,
//                     daysInYear: daysInYear,
//                     repPrincipal: dailyRepPrincipal,
//                     repInterest: dailyRepInterest,
//                     isRateChanged: isRateChangedToday,
//                 };
//             } else {
//                 currentPeriod.endDate = new Date(d);
//             }
//
//             currentPeriod.days += 1;
//             const dailyInterest = (currentDebt * (currentRate / 100)) / daysInYear;
//             currentPeriod.interestAccruedInPeriod += dailyInterest;
//
//             d.setDate(d.getDate() + 1);
//         }
//
//         if (currentPeriod) periods.push(currentPeriod);
//
//         return periods.map((p) => {
//             runningTotalInterestAccrued += p.interestAccruedInPeriod;
//             return {
//                 ...p,
//                 runningTotalInterestAccrued,
//                 totalPaidInterestAtThisPoint: totalPaidInterest,
//             };
//         });
//     }, [amount, startDate, endDate, baseRate, earlyRepayments, rateChanges]);
//
//     const totalDays = calculations.reduce((sum, p) => sum + p.days, 0);
//     const finalTotalInterestAccrued =
//         calculations.length > 0
//             ? calculations[calculations.length - 1].runningTotalInterestAccrued
//             : 0;
//     const totalPaidInterestOverall = calculations.reduce((sum, p) => sum + p.repInterest, 0);
//     const finalDebtPrincipal =
//         calculations.length > 0 ? calculations[calculations.length - 1].debt : Number(amount);
//     const finalDebtOverall =
//         finalDebtPrincipal + finalTotalInterestAccrued - totalPaidInterestOverall;
//
//     return (
//         <div className={styles.container}>
//             <h2 className={styles.title}>Кредитный калькулятор</h2>
//
//             <div className={styles.formGrid}>
//                 <div className={styles.formGroup}>
//                     <label className={styles.label}>Сумма займа (₽)</label>
//                     <input
//                         type="number"
//                         value={amount}
//                         onChange={(e) => setAmount(e.target.value)}
//                         className={styles.input}
//                     />
//                 </div>
//                 <div className={styles.formGroup}>
//                     <label className={styles.label}>Базовая ставка (% годовых)</label>
//                     <input
//                         type="number"
//                         step="0.1"
//                         value={baseRate}
//                         onChange={(e) => setBaseRate(e.target.value)}
//                         className={styles.input}
//                     />
//                 </div>
//                 <div className={styles.formGroup}>
//                     <label className={styles.label}>Дата начала (А)</label>
//                     <input
//                         type="date"
//                         value={startDate}
//                         onChange={(e) => setStartDate(e.target.value)}
//                         className={styles.input}
//                     />
//                 </div>
//                 <div className={styles.formGroup}>
//                     <label className={styles.label}>Дата окончания (Б)</label>
//                     <input
//                         type="date"
//                         value={endDate}
//                         onChange={(e) => setEndDate(e.target.value)}
//                         className={styles.input}
//                     />
//                 </div>
//
//                 <div className={styles.sectionDivider}>
//                     <h3 className={styles.subtitle}>Дополнительные условия</h3>
//                 </div>
//
//                 <div className={styles.conditionBlock}>
//                     <p className={styles.conditionBlockTitle}>Досрочные погашения</p>
//                     <div className={styles.conditionForm}>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>Тип погашения</label>
//                             <select
//                                 value={repTypeInput}
//                                 onChange={(e) => setRepTypeInput(e.target.value)}
//                                 className={styles.select}
//                             >
//                                 <option value="principal">Основной долг</option>
//                                 <option value="interest">Начисленные проценты</option>
//                             </select>
//                         </div>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>Сумма (₽)</label>
//                             <input
//                                 type="number"
//                                 value={repAmountInput}
//                                 onChange={(e) => setRepAmountInput(e.target.value)}
//                                 className={styles.input}
//                                 placeholder="0"
//                             />
//                         </div>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>Дата</label>
//                             <input
//                                 type="date"
//                                 value={repDateInput}
//                                 onChange={(e) => setRepDateInput(e.target.value)}
//                                 className={styles.input}
//                             />
//                         </div>
//                         <button onClick={handleAddRepayment} className={styles.addBtn}>
//                             Добавить
//                         </button>
//                     </div>
//                     {earlyRepayments.length > 0 && (
//                         <div className={styles.list}>
//                             {earlyRepayments.map((rep) => (
//                                 <div key={rep.id} className={styles.listItem}>
//                                     <span>
//                                         {formatDate(rep.date)}: <b>{formatMoney(rep.amount)}</b>
//                                         <span
//                                             style={{
//                                                 color: '#6b7280',
//                                                 fontSize: '12px',
//                                                 marginLeft: '6px',
//                                             }}
//                                         >
//                                             ({rep.type === 'principal' ? 'осн. долг' : 'проценты'})
//                                         </span>
//                                     </span>
//                                     <button
//                                         onClick={() => handleRemoveRepayment(rep.id)}
//                                         className={styles.deleteBtn}
//                                         title="Удалить"
//                                     >
//                                         ✕
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//
//                 <div className={styles.conditionBlock}>
//                     <p className={styles.conditionBlockTitle}>Аннуитетные платежи</p>
//                     <div className={styles.conditionForm}>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>Дата от</label>
//                             <input
//                                 type="date"
//                                 value={annuityStart}
//                                 onChange={(e) => setAnnuityStart(e.target.value)}
//                                 className={styles.input}
//                             />
//                         </div>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>Дата до</label>
//                             <input
//                                 type="date"
//                                 value={annuityEnd}
//                                 onChange={(e) => setAnnuityEnd(e.target.value)}
//                                 className={styles.input}
//                             />
//                         </div>
//                         <button onClick={handleAddAnnuity} className={styles.addBtn}>
//                             Добавить
//                         </button>
//                     </div>
//                     {annuities.length > 0 && (
//                         <div className={styles.list}>
//                             {annuities.map((ann) => (
//                                 <div key={ann.id} className={styles.listItem}>
//                                     <span>
//                                         {formatDate(ann.start)} – {formatDate(ann.end)}:<br />
//                                         <b>{formatMoney(ann.value)}</b> в месяц{' '}
//                                         <span style={{fontSize: '11px', color: '#6b7280'}}>
//                                             ({ann.months} мес.)
//                                         </span>
//                                     </span>
//                                     <button
//                                         onClick={() => handleRemoveAnnuity(ann.id)}
//                                         className={styles.deleteBtn}
//                                         title="Удалить"
//                                     >
//                                         ✕
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//
//                 <div className={styles.conditionBlock}>
//                     <p className={styles.conditionBlockTitle}>Изменения процентной ставки</p>
//                     <div className={styles.conditionForm}>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>Новая ставка (%)</label>
//                             <input
//                                 type="number"
//                                 step="0.1"
//                                 value={rateInput}
//                                 onChange={(e) => setRateInput(e.target.value)}
//                                 className={styles.input}
//                                 placeholder="0"
//                             />
//                         </div>
//                         <div className={styles.formGroup}>
//                             <label className={styles.label}>С даты</label>
//                             <input
//                                 type="date"
//                                 value={rateDateInput}
//                                 onChange={(e) => setRateDateInput(e.target.value)}
//                                 className={styles.input}
//                             />
//                         </div>
//                         <button onClick={handleAddRateChange} className={styles.addBtn}>
//                             Добавить
//                         </button>
//                     </div>
//                     {rateChanges.length > 0 && (
//                         <div className={styles.list}>
//                             {rateChanges.map((rateObj) => (
//                                 <div key={rateObj.id} className={styles.listItem}>
//                                     <span>
//                                         С {formatDate(rateObj.date)}: <b>{rateObj.rate}%</b>
//                                     </span>
//                                     <button
//                                         onClick={() => handleRemoveRateChange(rateObj.id)}
//                                         className={styles.deleteBtn}
//                                         title="Удалить"
//                                     >
//                                         ✕
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//
//             {calculations.length > 0 && (
//                 <>
//                     <div className={styles.tableSection}>
//                         <h3 className={styles.tableTitle}>Сводная таблица платежей</h3>
//                         <div className={styles.tableWrapper}>
//                             <table className={styles.table}>
//                                 <thead>
//                                 <tr>
//                                     <th className={styles.th}>Дата платежа</th>
//                                     <th className={styles.th}>Период (дн.)</th>
//                                     <th className={styles.th}>Ставка</th>
//                                     <th className={styles.th}>Начислено %</th>
//                                     <th className={styles.th}>Осн. долг</th>
//                                     <th className={styles.th}>Задолженность все</th>
//                                     <th className={`${styles.th} ${styles.annuityTh}`}>
//                                         Аннуитет
//                                     </th>
//                                 </tr>
//                                 </thead>
//                                 <tbody>
//                                 {calculations.map((period, index) => {
//                                     let paidInterestUntilNow = 0;
//                                     for (let i = 0; i <= index; i++)
//                                         paidInterestUntilNow += calculations[i].repInterest;
//
//                                     console.log('period', period);
//
//                                     const totalDebtHere =
//                                         period.debt +
//                                         period.runningTotalInterestAccrued -
//                                         paidInterestUntilNow;
//                                     const annuityVal = getAnnuityValueForDate(period.endDate);
//
//                                     return (
//                                         <tr key={index} className={styles.tr}>
//                                             <td className={styles.td}>
//                                                 {formatDate(period.endDate)}
//                                             </td>
//                                             <td className={styles.td}>{period.days}</td>
//                                             <td className={styles.td}>{period.rate}%</td>
//                                             <td className={styles.td}>
//                                                 {formatMoney(period.interestAccruedInPeriod)}
//                                             </td>
//                                             <td className={styles.td}>
//                                                 {formatMoney(period.debt)}
//                                             </td>
//                                             <td
//                                                 className={`${styles.td} ${styles.tdHighlight}`}
//                                             >
//                                                 {formatMoney(totalDebtHere)}
//                                             </td>
//                                             <td className={`${styles.td} ${styles.annuityTd}`}>
//                                                 {annuityVal !== null
//                                                     ? formatMoney(annuityVal)
//                                                     : '—'}
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                                 </tbody>
//                                 <tfoot className={styles.tfoot}>
//                                 <tr>
//                                     <td className={styles.td}>Итого</td>
//                                     <td className={styles.td}>{totalDays}</td>
//                                     <td className={styles.td}>—</td>
//                                     <td className={styles.td}>
//                                         {formatMoney(finalTotalInterestAccrued)}
//                                     </td>
//                                     <td className={styles.td}>
//                                         {formatMoney(finalDebtPrincipal)}
//                                     </td>
//                                     <td className={`${styles.td} ${styles.tdHighlight}`}>
//                                         {formatMoney(finalDebtOverall)}
//                                     </td>
//                                     <td className={`${styles.td} ${styles.annuityTfoot}`}></td>
//                                 </tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//                     </div>
//
//                     <div>
//                         <div
//                             className={styles.cardsHeader}
//                             onClick={() => setShowCards(!showCards)}
//                         >
//                             <p className={styles.cardsTitle}>Детализация начислений (формулы)</p>
//                             <span
//                                 className={`${styles.toggleIcon} ${showCards ? styles.toggleIconOpen : ''}`}
//                             >
//                                 ▼
//                             </span>
//                         </div>
//
//                         {showCards && (
//                             <div className={styles.resultList}>
//                                 {calculations.map((period, index) => {
//                                     const isHighlighted =
//                                         period.repPrincipal > 0 ||
//                                         period.repInterest > 0 ||
//                                         period.isRateChanged;
//
//                                     console.log('period', period);
//
//                                     const annuityVal = getAnnuityValueForDate(period.endDate);
//
//                                     return (
//                                         <div
//                                             key={index}
//                                             className={`${styles.resultCard} ${isHighlighted ? styles.highlightedCard : ''}`}
//                                         >
//                                             {isHighlighted && (
//                                                 <div className={styles.badge}>
//                                                     {period.repPrincipal > 0 &&
//                                                         `Погашение осн. долга (${formatMoney(period.repPrincipal)}) `}
//                                                     {period.repInterest > 0 &&
//                                                         `Погашение % (${formatMoney(period.repInterest)}) `}
//                                                     {period.isRateChanged && 'Смена ставки'}
//                                                 </div>
//                                             )}
//                                             <div className={styles.resultGrid}>
//                                                 <div className={styles.resultLabel}>дата</div>
//                                                 <div className={styles.resultValue}>
//                                                     {formatDate(period.startDate)} –{' '}
//                                                     {formatDate(period.endDate)}
//                                                 </div>
//
//                                                 <div className={styles.resultLabel}>долг</div>
//                                                 <div className={styles.resultValue}>
//                                                     {formatMoney(period.debt)}
//                                                 </div>
//
//                                                 <div className={styles.resultLabel}>
//                                                     дни в периоде ({period.rate}%)
//                                                 </div>
//                                                 <div className={styles.resultValue}>
//                                                     {period.days}
//                                                 </div>
//
//                                                 <div className={styles.resultLabel}>
//                                                     формула начисления
//                                                 </div>
//                                                 <div>
//                                                     <span className={styles.formula}>
//                                                         {formatNum(period.debt)} × {period.days} /{' '}
//                                                         {period.daysInYear} × {period.rate}%
//                                                     </span>
//                                                 </div>
//
//                                                 <div
//                                                     className={`${styles.resultLabel} ${styles.totalRow}`}
//                                                 >
//                                                     начисленные проценты
//                                                 </div>
//                                                 <div
//                                                     style={{color: '#15803d', fontWeight: '600'}}
//                                                     className={styles.totalRow}
//                                                 >
//                                                     {formatMoney(period.interestAccruedInPeriod)}
//                                                 </div>
//
//                                                 <div
//                                                     className={`${styles.resultLabel} ${styles.totalRow}`}
//                                                 >
//                                                     проценты всего начислено
//                                                 </div>
//                                                 <div
//                                                     className={`${styles.resultValue} ${styles.totalRow}`}
//                                                 >
//                                                     {formatMoney(
//                                                         period.runningTotalInterestAccrued
//                                                     )}
//                                                 </div>
//
//                                                 {/* ДОБАВЛЕННЫЙ БЛОК АННУИТЕТА В КАРТОЧКАХ */}
//                                                 {annuityVal !== null && (
//                                                     <>
//                                                         <div
//                                                             className={`${styles.resultLabel} ${styles.totalRow}`}
//                                                             style={{color: '#1e3a8a'}}
//                                                         >
//                                                             аннуитетный платеж
//                                                         </div>
//                                                         <div
//                                                             className={`${styles.resultValue} ${styles.totalRow}`}
//                                                             style={{color: '#1e3a8a'}}
//                                                         >
//                                                             {formatMoney(annuityVal)}
//                                                         </div>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };
//
// export default MainCalc;
