import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './projectSave.module.css';
import {AnnuityType, EarlyRepaymentType, PenaltyType, RateChangeType} from '../mainCalc/mainCalcTypes';

const API_URL = 'http://localhost:8080/api';

export type ProjectDataPayloadType = {
    amount: number;
    baseRate: number;
    startDate: string;
    endDate: string;
    earlyRepayments: EarlyRepaymentType[];
    rateChanges: RateChangeType[];
    annuities: AnnuityType[];
    penalties: PenaltyType[];
    isGlobalPenalty: boolean;
    globalPenaltyRate: number;
}

type ProjectManagementPropsType = {
    currentData: ProjectDataPayloadType;
    onLoadProject: (data: never) => void;
}

export const ProjectSave = ({ currentData, onLoadProject }: ProjectManagementPropsType) => {
    const [filename, setFilename] = useState<string>('my_project');
    const [modifierName, setModifierName] = useState<string>('User');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                filename,
                lastModifier: modifierName,
                data: currentData
            };
            const response = await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Ошибка сохранения');
            return response.json();
        },
        onSuccess: () => alert('Проект успешно сохранен!'),
        onError: (err) => alert(`Ошибка: ${err.message}`)
    });

    const loadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/load`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Ошибка загрузки');
            return response.json();
        },
        onSuccess: (data) => {
            setFilename(data.filename);
            setModifierName(data.lastModifier);
            // @ts-expect-error - fix types
            onLoadProject(data.data);

            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (err) => alert(`Ошибка: ${err.message}`)
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadMutation.mutate(file);
        }
    };

    return (
        <div className={styles.panel}>
            <h3 className={styles.title}>Управление проектом</h3>
            <div className={styles.controls}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Имя файла</label>
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Пользователь</label>
                    <input
                        type="text"
                        value={modifierName}
                        onChange={(e) => setModifierName(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className={styles.buttonSave}
                >
                    {saveMutation.isPending ? 'Сохранение...' : 'Сохранить на диск'}
                </button>

                <div style={{ position: 'relative' }}>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className={styles.buttonLoadLabel}>
                        {loadMutation.isPending ? 'Загрузка...' : 'Загрузить из файла'}
                    </label>
                </div>
            </div>
        </div>
    );
};