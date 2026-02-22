import { useState } from 'react';
import styles from './penaltySection.module.css';
import { formatDate } from 'utils/dateChecks';
import { PenaltyType } from '../mainCalc/mainCalcTypes';

type PropsType =  {
    penalties: PenaltyType[];
    onAdd: (item: Omit<PenaltyType, 'id'>) => void;
    onRemove: (id: number) => void;
    isGlobal: boolean;
    setIsGlobal: (val: boolean) => void;
    globalRate: number;
    setGlobalRate: (val: number) => void;
}

export const PenaltySection = ({ penalties, onAdd, onRemove, isGlobal, setIsGlobal, globalRate, setGlobalRate }: PropsType) => {
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');
    const [rate, setRate] = useState<string>('');

    const handleAdd = () => {
        if (start && end && rate !== '') {
            onAdd({ start, end, rate: Number(rate) });
            setStart('');
            setEnd('');
            setRate('');
        }
    };

    return (
        <div className={styles.conditionBlock}>
            <p className={styles.conditionBlockTitle}>Начисление Пени (просрочка)</p>

            <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                    <input type="radio" checked={isGlobal} onChange={() => setIsGlobal(true)} />
                    Всегда на весь период
                </label>
                <label className={styles.radioLabel}>
                    <input type="radio" checked={!isGlobal} onChange={() => setIsGlobal(false)} />
                    Задавать периоды вручную
                </label>
            </div>

            {isGlobal ? (
                <div className={styles.conditionForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Ставка пени (% годовых)</label>
                        <input type="number" step="0.1" value={globalRate} onChange={(e) => setGlobalRate(Number(e.target.value))} className={styles.input} />
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.conditionForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>От</label>
                            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>До</label>
                            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Ставка (% годовых)</label>
                            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={styles.input} placeholder="20" />
                        </div>
                        <button onClick={handleAdd} className={styles.addBtn}>Добавить</button>
                    </div>
                    <div className={styles.list}>
                        {penalties.map((p) => (
                            <div key={p.id} className={styles.listItem}>
                                <span>{formatDate(p.start)} – {formatDate(p.end)}: <b>{p.rate}% годовых</b></span>
                                <button onClick={() => onRemove(p.id)} className={styles.deleteBtn}>✕</button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};