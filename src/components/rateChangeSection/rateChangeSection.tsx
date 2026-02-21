import { useState } from 'react';
import styles from './rateChangeSection.module.css';
import { formatDate } from 'utils/dateChecks';
import {RateChangeType} from "components/mainCalc/mainCalcTypes";

type PropsType = {
    rateChanges: RateChangeType[];
    onAdd: (item: Omit<RateChangeType, 'id'>) => void;
    onRemove: (id: number) => void;
}

export const RateChangeSection = ({ rateChanges, onAdd, onRemove }: PropsType) => {
    const [rate, setRate] = useState<string>('');
    const [date, setDate] = useState<string>('');

    const handleAdd = () => {
        if (rate !== '' && date) {
            onAdd({ rate: Number(rate), date });
            setRate('');
            setDate('');
        }
    };

    return (
        <div className={styles.conditionBlock}>
            <p className={styles.conditionBlockTitle}>Изменения процентной ставки</p>
            <div className={styles.conditionForm}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Новая ставка (%)</label>
                    <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className={styles.input} placeholder="0" />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>С даты</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} />
                </div>
                <button onClick={handleAdd} className={styles.addBtn}>Добавить</button>
            </div>
            <div className={styles.list}>
                {rateChanges.map((r) => (
                    <div key={r.id} className={styles.listItem}>
                        <span>С {formatDate(r.date)}: <b>{r.rate}%</b></span>
                        <button onClick={() => onRemove(r.id)} className={styles.deleteBtn}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
};