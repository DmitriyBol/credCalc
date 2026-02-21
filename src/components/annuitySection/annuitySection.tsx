import { useState } from 'react';
import styles from './annuitySection.module.css';
import { formatDate, formatMoney } from 'utils/dateChecks';
import {AnnuityType} from "components/mainCalc/mainCalcTypes";

type PropsType = {
    annuities: AnnuityType[];
    onAdd: (item: Omit<AnnuityType, 'id'>) => void;
    onRemove: (id: number) => void;
    baseRate: number;
    amount: number;
}

export const AnnuitySection = ({ annuities, onAdd, onRemove, baseRate, amount: loanAmount }: PropsType) => {
    const [start, setStart] = useState<string>('');
    const [end, setEnd] = useState<string>('');

    const handleAdd = () => {
        const sDate = new Date(start);
        const eDate = new Date(end);
        if (start && end && eDate > sDate) {
            const diffDays = Math.ceil(Math.abs(eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24));
            const months = Math.round(diffDays / 30.4167) || 1;
            const monthlyRate = baseRate / 100 / 12;

            const value = monthlyRate === 0
                ? loanAmount / months
                : loanAmount * ((monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));

            onAdd({ start, end, value, months });
            setStart('');
            setEnd('');
        }
    };

    return (
        <div className={styles.conditionBlock}>
            <p className={styles.conditionBlockTitle}>Аннуитетные платежи</p>
            <div className={styles.conditionForm}>
                <div className={styles.formGroup}><label className={styles.label}>От</label>
                    <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.formGroup}><label className={styles.label}>До</label>
                    <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={styles.input} />
                </div>
                <button onClick={handleAdd} className={styles.addBtn}>Добавить</button>
            </div>
            <div className={styles.list}>
                {annuities.map((ann) => (
                    <div key={ann.id} className={styles.listItem}>
                        <span>{formatDate(ann.start)} – {formatDate(ann.end)}:<br /><b>{formatMoney(ann.value)}</b>/мес</span>
                        <button onClick={() => onRemove(ann.id)} className={styles.deleteBtn}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
};