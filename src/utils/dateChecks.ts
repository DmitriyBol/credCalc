export const formatMoney = (val: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(val);

export const formatNum = (val: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

export const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

export const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
