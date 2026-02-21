import { useState } from 'react';
import styles from './detailedCards.module.css';
import { formatDate, formatMoney, formatNum } from 'utils/dateChecks';
import { CalculationPeriodType } from 'components/mainCalc/mainCalcTypes';

type PropsType = {
    calculations: CalculationPeriodType[];
    getAnnuityValue: (dateObj: Date) => number | null;
}

export const DetailedCards = ({ calculations, getAnnuityValue }: PropsType) => {
    const [showCards, setShowCards] = useState(false);

    return (
        <div style={{ marginTop: '24px' }}>
            <div className={styles.cardsHeader} onClick={() => setShowCards(!showCards)}>
                <p className={styles.cardsTitle}>Детализация начислений (формулы)</p>
                <span className={`${styles.toggleIcon} ${showCards ? styles.toggleIconOpen : ''}`}>▼</span>
            </div>

            {showCards && (
                <div className={styles.resultList}>
                    {calculations.map((period, index) => {
                        const isHighlighted = period.repPrincipal > 0 || period.repInterest > 0 || period.isRateChanged;
                        const annuityVal = getAnnuityValue(period.endDate);

                        return (
                            <div key={index} className={`${styles.resultCard} ${isHighlighted ? styles.highlightedCard : ''}`}>
                                {isHighlighted && (
                                    <div className={styles.badge}>
                                        {period.repPrincipal > 0 && `Погашение долга (${formatMoney(period.repPrincipal)}) `}
                                        {period.repInterest > 0 && `Погашение % (${formatMoney(period.repInterest)}) `}
                                        {period.isRateChanged && 'Смена ставки'}
                                    </div>
                                )}
                                <div className={styles.resultGrid}>
                                    <div className={styles.resultLabel}>период</div>
                                    <div className={styles.resultValue}>{formatDate(period.startDate)} – {formatDate(period.endDate)}</div>

                                    <div className={styles.resultLabel}>база для %</div>
                                    <div className={styles.resultValue}>{formatMoney(period.debt)}</div>

                                    <div className={styles.resultLabel}>дни ({period.rate}%)</div>
                                    <div className={styles.resultValue}>{period.days} дн.</div>

                                    <div className={styles.resultLabel}>формула %</div>
                                    <div>
                                        <span className={styles.formula}>
                                            {formatNum(period.debt)} × {period.days} / {period.daysInYear} × {period.rate}%
                                        </span>
                                    </div>

                                    <div className={`${styles.resultLabel} ${styles.totalRow}`}>начислено %</div>
                                    <div className={styles.totalRow} style={{ color: '#15803d' }}>{formatMoney(period.interestAccruedInPeriod)}</div>

                                    {period.penaltyAccruedInPeriod > 0 && (
                                        <>
                                            <div className={`${styles.resultLabel} ${styles.totalRow}`} style={{ color: '#dc2626' }}>пени</div>
                                            <div className={`${styles.resultValue} ${styles.totalRow}`} style={{ color: '#dc2626' }}>{formatMoney(period.penaltyAccruedInPeriod)}</div>
                                        </>
                                    )}

                                    {annuityVal && (
                                        <>
                                            <div className={`${styles.resultLabel} ${styles.totalRow}`} style={{ color: '#1e3a8a' }}>аннуитет</div>
                                            <div className={`${styles.resultValue} ${styles.totalRow}`} style={{ color: '#1e3a8a' }}>{formatMoney(annuityVal)}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};