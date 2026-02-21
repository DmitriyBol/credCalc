import { useState } from 'react';
import styles from './repaymentSection.module.css';
import { formatDate, formatMoney } from 'utils/dateChecks';
import {EarlyRepaymentType} from "components/mainCalc/mainCalcTypes";

type PropsType = {
    repayments: EarlyRepaymentType[];
    onAdd: (item: Omit<EarlyRepaymentType, 'id'>) => void;
    onRemove: (id: number) => void;
}

export const RepaymentSection = ({ repayments, onAdd, onRemove }: PropsType) => {
    const [type, setType] = useState<'principal' | 'interest'>('principal');
    const [amount, setAmount] = useState<string>('');
    const [date, setDate] = useState<string>('');

    const handleAdd = () => {
        if (Number(amount) > 0 && date) {
            onAdd({ type, amount: Number(amount), date });
            setAmount('');
            setDate('');
        }
    };

    return (
        <div className={styles.conditionBlock}>
            <p className={styles.conditionBlockTitle}>Досрочные погашения</p>
            <div className={styles.conditionForm}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Тип</label>
                    <select value={type} onChange={(e) => setType(e.target.value as 'principal' | 'interest')} className={styles.select}>
                        <option value="principal">Основной долг</option>
                        <option value="interest">Проценты</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Сумма (₽)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Дата</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} />
                </div>
                <button onClick={handleAdd} className={styles.addBtn}>Добавить</button>
            </div>
            <div className={styles.list}>
                {repayments.map((rep) => (
                    <div key={rep.id} className={styles.listItem}>
                        <span>
                            {formatDate(rep.date)}: <b>{formatMoney(rep.amount)}</b>
                            <span style={{ color: '#6b7280', fontSize: '12px', marginLeft: '6px' }}>
                                ({rep.type === 'principal' ? 'осн. долг' : 'проценты'})
                            </span>
                        </span>
                        <button onClick={() => onRemove(rep.id)} className={styles.deleteBtn}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
};